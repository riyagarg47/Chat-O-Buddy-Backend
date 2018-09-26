/**
 * modules dependencies.
 */
const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib.js');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const tokenLib = require("./tokenLib.js");
const check = require("./checkLib.js");
const response = require('./responseLib')
const ChatModel = mongoose.model('Chat');
const RoomModel = mongoose.model('Room');

const redisLib = require("./redisLib.js");

let setServer = (server) => {

    let io = socketio.listen(server); // collection of all connections on server
    let myIo = io.of('/') //namespace OR global instance of io can be used for cross socket communication.

    //main events handler, all events will be inside this handler
    myIo.on('connection', (socket) => {

        /*----------- Emitting verify User to verify the user-----------*/
        /**
         * @api {listen} verifyUser Verification of user
         * @apiVersion 0.0.1
         * @apiGroup Listen 
         * @apiDescription This event <b>("verifyUser")</b> has to be listened on the user's end to verify user authentication.
            User will only be set as online user after verification of authentication token.
        */
        socket.emit("verifyUser", "");
            /**
             * @api {emit} set-user Setting user online
             * @apiVersion 0.0.1
             * @apiGroup Emit 
             *@apiDescription This event <b>("set-user")</b> has to be emitted when a user comes online.
                User can only be set as online into online user hash only after verification of authentication token. Which you have pass here. The following data has to be emitted
            */
    
        socket.on('set-user', (authToken) => {
            
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    /**
                         * @api {listen} auth-error Emitting auth error on fail of token verification
                         * @apiVersion 0.0.1
                         * @apiGroup Listen 
                         *@apiDescription This event <b>("auth-error")</b> has to be listened by the current room and will be triggered if there comes any auth-token error
                            *@apiExample The example data as output
                            *{
                                {
                                "status": 500,
                                "error": Please provide correct auth token
                                }
                            }
                        */
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else {
                    console.log("user is verified..setting details");
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    let key = socket.userId
                    let value = fullName
                    redisLib.setANewOnlineUserInHash("onlineUsers", key, value, (err, result) => {
                        if (err) {
                            logger.error(err.message, "socketLib:setANewUserOnlineInHash", 10)
                        } else {
                            // getting online users list.
                            redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(`${fullName} successfully added to online user list.`)
                                    logger.info(`${fullName} successfully added to online user list.`)
                                    console.log(`${fullName} is online`);
                                    // setting room name
                                    socket.room = 'Chat-O-Buddy-Group'
                                    // joining chat-group room.
                                    socket.join(socket.room)
                                    // socket.to(socket.room).broadcast.emit('online-user-list', result);
                                     socket.emit('online-user-list',result)
                                    myIo.to(socket.room).emit('online-user-list', result);
                                }
                            })
                        }//end else
                        
                    })// end set new online users in hash

                }
            })// end verify claim without secret

        }) // end of listening set-user event


        socket.on('disconnect', () => {
            console.log("user is disconnected");
            console.log(socket.userId);

            //user will emit when disconnected
            //will remove user from online user list
            if (socket.userId) {
                redisLib.deleteUserFromHash('onlineUsers', socket.userId)
                redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                    if (err) {
                        logger.error(err.message, "socketLib:getAllUsersInAHash", 10)
                    } else {
                       socket.leave(socket.room)
                        // socket.to(socket.room).broadcast.emit('online-user-list', result);
                        myIo.to(socket.room).emit('online-user-list',result)
                        socket.emit('online-user-list',result)

                    }
                })//end get all users in a hash
            }
        }) // end of on disconnect


        socket.on('chat-msg', (data) => {
            console.log("socket chat-msg called")
            console.log(data);
            data['chatId'] = shortid.generate()
            console.log(data);

            // event to save chat.
            setTimeout(function () {
                eventEmitter.emit('individual-save-chat', data);
            }, 2000)
            myIo.emit(data.receiverId, data)
           // myIo.to(data.receiverId).emit('message', data);   

        }); // end chat-msg


        socket.on('room-chat-msg', (data) => {
            console.log("socket room-chat-msg called")
            console.log(data);
            data['chatId'] = shortid.generate()
            console.log(data);

            // event to save chat.
            setTimeout(function () {
                eventEmitter.emit('room-save-chat', data);
            }, 2000)
            //myIo.emit(data.receiverId, data)
            myIo.to(data.receiverId).emit('message', data); 

        }); // end room-chat-msg



        socket.on('typing', (fullName) => {
            socket.to(socket.room).broadcast.emit('typing', fullName);
        });// end typing


    });// end connection
}//end setServer


// database operations are kept outside of socket.io code.

// saving chats to database.
eventEmitter.on('individual-save-chat', (data) => {

    let newChat = new ChatModel({

        chatId: data.chatId,
        senderName: data.senderName,
        senderId: data.senderId,
        receiverName: data.receiverName || '',
        receiverId: data.receiverId || '',
        message: data.message,
        chatRoomId: data.chatRoomId || '',
        createdOn: data.createdOn

    });

    newChat.save((err, result) => {
        if (err) {
            logger.error("error occurred", "socketLib:individual-save-chat", 10);
        }
        else if (check.isEmpty(result)) {
            logger.error("Chat Is Not Saved", "socketLib:individual-save-chat", 10);
        }
        else {
            logger.info("Chat Saved", "socketLib:individual-save-chat", 10);
            console.log(result);
        }
    });

}); // end of saving chat.

// saving chats to database.
eventEmitter.on('room-save-chat', (data) => {

    let newChat = new ChatModel({

        chatId: data.chatId,
        senderName: data.senderName,
        senderId: data.senderId,
        receiverName: data.receiverName || '',
        receiverId: data.receiverId || '',
        message: data.message,
        chatRoomId: data.chatRoomId || '',
        createdOn: data.createdOn

    });

    newChat.save((err, result) => {
        if (err) {
            logger.error("error occurred", "socketLib:room-save-chat", 10);
        }
        else if (check.isEmpty(result)) {
            logger.error("Chat Is Not Saved", "socketLib:room-save-chat", 10);
        }
        else {
            logger.info("Chat Saved", "socketLib:room-save-chat", 10);
            console.log(result);
        }
    });

}); // end of saving chat.


//redis code 

module.exports = {
    setServer: setServer
}
