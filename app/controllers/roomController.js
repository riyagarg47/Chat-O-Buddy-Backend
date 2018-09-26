/**
 * module dependencies.
 */
const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const mailer = require('./../libs/mailerLib')

/* Models */
const ChatModel = mongoose.model('Chat')
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')
const RoomModel = mongoose.model('Room')

/* Get all room Details */
let getAllRooms = (req, res) => {
    RoomModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, ' roomController: getAllRooms', 10)
                let apiResponse = response.generate(true, 'Failed To Find Room Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No Room Found', 'roomController: getAllRooms')
                let apiResponse = response.generate(true, 'No Room Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All room Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all rooms

let getSingleRoom = (req, res) => {
    if (req.params.chatRoomId){
        RoomModel.findOne({ roomId: req.params.chatRoomId }, (err, roomDetails) => {
            if (err) {
                logger.error('Failed to find rooms', "roomController: getSingleRoom", 10);
                let apiResponse = response.generate(true, "failed to find the Room", 500, null);
                res.send(apiResponse);
            }
            else if (check.isEmpty(roomDetails)) {
                logger.info("No Room Found", "roomController: getSingleRoom", 10);
                let apiResponse = response.generate(true, "No Room Found", 404, null);
                res.send(apiResponse);
            }
            else {
                logger.info("Room found", "roomController: getSingleRoom", 10);
                let apiResponse = response.generate(false, "Group found", 200, roomDetails);
                res.send(apiResponse);
            }
        });
    } else{
        logger.error("chatRoomId is missing", "roomController: getSingleRoom", 10);
        let apiResponse = response.generate(true, "chatRoomId is missing", 500, null);
        res.send(apiResponse);
    }

}//end getSingleRoom


let createChatRoom = (req, res) =>{
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if(req.body.userEmail) {
                UserModel.findOne({email: req.body.userEmail}, (err, userDetails) => {
                    if(err) {
                        logger.error(err.message, 'roomController: createChatRoom()', 10)
                        let apiResponse = response.generate(true, 'Failed to find user, room cannot be created', 500, null)
                        reject(apiResponse)
                    } 
                    else if(check.isEmpty(userDetails)) {
                        logger.info('User not found', 'roomController: createChatRoom', 10)
                        let apiResponse = response.generate(true, 'User not found, chat room creation failed', 404, null)
                        reject(apiResponse)
                    } 
                    else {
                        let admin = {
                        name: `${userDetails.firstName} ${userDetails.lastName}`,
                        Id: userDetails.userId
                        }
                        let newChatRoom = new RoomModel({
                            roomId: shortid.generate(),
                            roomName: req.body.roomName,
                            admin: admin,
                            members: admin
                        });
                        userDetails.groups.push(newChatRoom.roomId)

                        newChatRoom.save((err, newChatRoom) => {
                            if(err) {
                                logger.error(err.message, 'roomController: createChatRoom()', 10)
                                let apiResponse = response.generate(true, 'Failed to create chat room', 500, null)
                                reject(apiResponse)
                            } else {
                                logger.info('chat room created successfully', 'roomController: createChatRoom()', 10)
                                let data = {
                                userDetails: userDetails,
                                newRoom: newChatRoom
                                }
                                resolve(data)
                            }
                        }) // end newChatRoom save
                    }
                }) // end findOne
            } else{
                        logger.error(err.message, 'roomController: createChatRoom()', 10)
                        let apiResponse = response.generate(true, 'Failed to find user, room cannot be created', 500, null)
                        reject(apiResponse)
            }
        })// end promise
    } //end findUser


    let saveDetails = (data) => {
        return new Promise((resolve, reject) => {
            UserModel.update({userId: data.userDetails.userId}, {groups: data.userDetails.groups}, {multi:true}, (err, result) =>{
                if(err) {
                    logger.error(err.message, 'roomController: createChatRoom()', 10)
                    let apiResponse = response.generate(true, 'Failed to save room details', 500, null)
                    reject(apiResponse)
                } 
                else if(check.isEmpty(result)) {
                    logger.info('Chat Room not saved', 'roomController: createChatRoom()', 10)
                    let apiResponse = response.generate(true, 'Chat room not saved', 500, null)
                    reject(apiResponse)
                } 
                else {
                    logger.info('ChatRoom saved to user details', 'roomController: createChatRoom()', 10)
                    resolve(data.newRoom)
                }
            })//end update UserModel
        })// end promise
    }// end save details
    
    findUser(req, res)
    .then(saveDetails)
    .then((result) => {
        let apiResponse = response.generate(false, 'Room saved successfully to user details', 200, result)
        res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err)
    });

}//end create chat room


let deleteChatRoom = (req, res) => {

    let findRoom = () => {
        return new Promise((resolve, reject) => {
            RoomModel.findOne({ roomId: req.params.chatRoomId }, (err, roomDetails) => {
                if (err) {
                    logger.error('Failed to find rooms', "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "failed to find the Room", 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(roomDetails)) {
                    logger.info("No Room Found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "No Room Found", 404, null);
                    reject(apiResponse);
                }
                else {
                    logger.info("Room found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(false, "Group found", 200, roomDetails);
                    resolve(apiResponse);
                }
            });
    });
    }//end findRoom

   let deleteRoom = () => {
    return new Promise((resolve, reject) => {
        RoomModel.remove({ roomId: req.params.chatRoomId }, (err, roomDetails) => {
            if (err) {
                logger.error(err.message, "roomController:deleteChatRoom()", 10);
                let apiResponse = response.generate(true, "Failed to delete chat room", 500, null);
                reject(apiResponse);
            }
            else if (check.isEmpty(roomDetails)) {
                logger.info('No chat room found', "roomController:deleteChatRoom()", 10);
                let apiResponse = response.generate(true, "No chat room found", 404, null);
                reject(apiResponse);
            }
            else {
                logger.info("Chat Room deleted", "roomrController: deleteChatRoom()", 10);
                let apiResponse = response.generate(false, "Chat Room deleted", 200, roomDetails);
                resolve(apiResponse);
            }
        });//end room
    });
    }// end deleteRoom


    findRoom(req, res)
    .then(deleteRoom)
    .then((roomDetails) => {
        let apiResponse = response.generate(false, 'Room deleted Successfully.', 200, roomDetails)
        res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err)
    });

}//end delete chat room


let editChatRoom = (req, res) => {

    let findRoom = () => {
        return new Promise((resolve, reject) => {
            RoomModel.findOne({ roomId: req.params.chatRoomId }, (err, roomDetails) => {
                if (err) {
                    logger.error('Failed to find rooms', "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "failed to find the Room", 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(roomDetails)) {
                    logger.info("No Room Found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "No Room Found", 404, null);
                    reject(apiResponse);
                }
                else {
                    logger.info("Room found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(false, "Group found", 200, roomDetails);
                    resolve(apiResponse);
                }
            });
    });
    }//end findRoom


let editRoom = () => {
    return new Promise((resolve, reject) => {
    let options = req.body;
    console.log(options)
        RoomModel.update({ roomId: req.params.chatRoomId },options).exec((err, roomDetails) => {
            if (err) {
                logger.error(err.message, "roomController:editChatRoom()", 10);
                let apiResponse = response.generate(true, "Failed to edit chat room", 500, null);
                reject(apiResponse);
            }
            else if (check.isEmpty(roomDetails)) {
                logger.info('No chat room found', "roomController:editChatRoom()", 10);
                let apiResponse = response.generate(true, "No chat room found", 404, null);
                reject(apiResponse);
            }
            else {
                logger.info("Chat Room edited Successfully", "roomController: editChatRoom()", 10);
                let apiResponse = response.generate(false, "Chat Room edited successfully", 200, roomDetails);
                resolve(apiResponse);
            }
        });//end room
    });
    }//end editRoom

    findRoom(req, res)
    .then(editRoom)
    .then((roomDetails) => {
        let apiResponse = response.generate(false, 'Room edited Successfully.', 200, roomDetails)
        res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err)
    });


}//end edit chat room


let closeChatRoom = (req, res) => {
    let findRoom = () => {
        return new Promise((resolve, reject) => {
            RoomModel.findOne({ roomId: req.params.chatRoomId }, (err, roomDetails) => {
                if (err) {
                    logger.error('Failed to find rooms', "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "failed to find the Room", 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(roomDetails)) {
                    logger.info("No Room Found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(true, "No Room Found", 404, null);
                    reject(apiResponse);
                }
                else {
                    logger.info("Room found", "roomController: getSingleRoom", 10);
                    let apiResponse = response.generate(false, "Group found", 200, roomDetails);
                    resolve(apiResponse);
                }
            });
    });
    }//end findRoom

let closeRoom = () => {
    return new Promise((resolve, reject) => {
        RoomModel.update({ roomId: req.params.chatRoomId }, { $set: { status: false }}).exec((err, roomDetails) => {
            if (err) {
                logger.error('Failed to find room', "roomController: closeChatRoom", 10);
                let apiResponse = response.generate(true, "failed to find the Room", 500, null);
                res.send(apiResponse);
            }
            else if (check.isEmpty(roomDetails)) {
                logger.info("No Room Found", "roomController: closeChatRoom", 10);
                let apiResponse = response.generate(true, "No Room Found", 404, null);
                res.send(apiResponse);
            }
            else {
                logger.info("Room found & marked close", "roomController: closeChatRoom", 10);
                let apiResponse = response.generate(false, "Group found & marked close", 200, roomDetails);
                res.send(apiResponse);
            }
        });
});
}// end closeRoom

findRoom(req, res)
    .then(closeRoom)
    .then((roomDetails) => {
        let apiResponse = response.generate(false, 'Room closed Successfully.', 200, roomDetails)
        res.send(apiResponse)
    })
    .catch((err) => {
        console.log(err);
        res.send(err)
    });


}//end closeChatRoom

let sendInvite = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.userEmail){
                UserModel.findOne({ email: req.body.userEmail }, (err, userDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve user Data', "roomController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(userDetails)) {
                        logger.info("No User Found", "roomController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "roomController: findUser()", 10);
                        let details = {};
                        details.userDetails = userDetails;
                        resolve(details);
                    }
                });
            } else  {
                logger.error("userEmail is missing", "roomController: sendInvite", 10);
                let apiResponse = response.generate(true, "userEmail is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findUser()

    let findRoom = (details) => {
        return new Promise((resolve, reject) => {
            if (req.body.chatRoomId) {
                RoomModel.findOne({ roomId: req.body.chatRoomId }, (err, roomDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve Group Data', "roomController: findRoom()", 10);
                        let apiResponse = response.generate(true, "failed to find the Group with given chatRoomId", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(roomDetails)) {
                        logger.info("No Group Found", "roomController: findRoom()", 10);
                        let apiResponse = response.generate(true, "No Group Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("Group found", "roomController: findRoom()", 10);
                        details.roomDetails = roomDetails;
                        resolve(details);
                    }
                });
            } else {
                logger.error("chatRoomId is missing", "roomController: findRoom()", 10);
                let apiResponse = response.generate(true, "chatRoomId is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findRoom()

    let sendMail = (details) => {
        return new Promise((reject, resolve) => {
            if(details)
            {
            logger.info("User & Group found", "roomController: sendMail()", 10);
            mailer.autoEmail(req.body.userEmail, `<a href='http://localhost:4200/joinGroup/${details.roomDetails.roomId}/${details.roomDetails.roomName}'>click here to join the Chat Room ${details.roomDetails.roomName}</a>`);
            let apiResponse = response.generate(false, "Mail sent successfully", 200,null);
            resolve(apiResponse);
            } else {
                logger.error(err.message, "Unable to send mail", 500, null)
                reject(apiResponse)
            }
        });

    }//end sendMail

    findUser(req, res)
        .then(findRoom)
        .then(sendMail)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            res.send(err);
        });

}//end of sendInvite()

let joinChatRoom = (req, res) => {
    let findUser = () => {
        return new Promise((resolve, reject) => {
            if (req.body.userEmail){
                UserModel.findOne({ email: req.body.userEmail }, (err, userDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve user Data', "roomController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(userDetails)) {
                        logger.info("No User Found", "roomController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "roomController: findUser()", 10);
                        let details = {};
                        details.userDetails = userDetails;
                        resolve(details);
                    }
                });
            } else  {
                logger.error("userEmail is missing", "roomController: sendInvite", 10);
                let apiResponse = response.generate(true, "userEmail is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findUser()

    let findRoom = (details) => {
        return new Promise((resolve, reject) => {
            if (req.body.chatRoomId) {
                RoomModel.findOne({ roomId: req.body.chatRoomId }, (err, roomDetails) => {
                    if (err) {
                        logger.error('Failed to retrieve Group Data', "roomController: findRoom()", 10);
                        let apiResponse = response.generate(true, "failed to find the Group with given chatRoomId", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(roomDetails)) {
                        logger.info("No Group Found", "roomController: findRoom()", 10);
                        let apiResponse = response.generate(true, "No Group Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("Group found", "roomController: findRoom()", 10);
                        details.roomDetails = roomDetails;
                        resolve(details);
                    }
                });
            } else {
                logger.error("chatRoomId is missing", "roomController: findRoom()", 10);
                let apiResponse = response.generate(true, "chatRoomId is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findRoom()

    let saveRoom = (details) => {

        return new Promise((resolve, reject) => {
            let user = {};
            user.name = `${details.userDetails.firstName} ${details.userDetails.lastName}`;
            user.Id = details.userDetails.userId;
            details.roomDetails.members.push(user);

            RoomModel.update({ roomId: req.body.chatRoomId }, { members: details.roomDetails.members }, { multi: true }, (err, result) => {
                if (err) {
                    logger.error(err.message, "chatRoomController:createChatRoom()", 10);
                    let apiResponse = response.generate("true", "Failed to save room details.", 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(result)) {
                    logger.error("User details not Saved", "chatRoomController: CreateChatRoom", 10);
                    let apiResponse = response.generate(true, "unable to save user to chat room", 500, null);
                    reject(apiResponse);
                } else {
                    logger.info("user saved to room details", "chatRoomController: createChatRoom", 10);
                    resolve(details);
                }
            });//end update for saving new room
        });//end promise
    }//end saveRoom
    let saveUser = (details) => {

        return new Promise((resolve, reject) => {
            details.userDetails.groups.push(req.body.chatRoomId);

            UserModel.update({ email: req.body.userEmail }, { groups: details.userDetails.groups }, { multi: true }, (err, result) => {
                if (err) {
                    logger.error(err.message, "chatRoomController:createChatRoom()", 10);
                    let apiResponse = response.generate("true", "Failed to save user chat details.", 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(result)) {
                    logger.error("User details not Saved", "chatRoomController: CreateChatRoom", 10);
                    let apiResponse = response.generate(true, "unable to save user to chat room", 500, null);
                    reject(apiResponse);
                } else {
                    logger.info("chatRoom saved to user details", "chatRoomController: createChatRoom", 10);
                    resolve(result);
                }
            });//end update for saving new room
        });//end promise
    }//end saveDetails

    findUser(req, res)
        .then(findRoom)
        .then(saveRoom)
        .then(saveUser)
        .then((result) => {
            let apiResponse = response.generate(false, "User & Group Saved", 200, result);
            res.send(apiResponse);
        })
        .catch((err) => {
            res.send(err);
        });

}//end JoinChatRoom


module.exports = {
    createChatRoom: createChatRoom, 
    deleteChatRoom: deleteChatRoom, 
    editChatRoom: editChatRoom, 
    getAllRooms: getAllRooms, 
    closeChatRoom: closeChatRoom, 
    getSingleRoom: getSingleRoom, 
    sendInvite: sendInvite,
    joinChatRoom: joinChatRoom 
}