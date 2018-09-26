const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const roomController = require("./../../app/controllers/roomController");
const chatController = require("./../../app/controllers/chatController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/room`

    app.get(`${baseUrl}/view/all`, roomController.getAllRooms); 

    // params: chatRoomId.
    app.get(`${baseUrl}/:chatRoomId/details`, roomController.getSingleRoom);  
    /**
     * @apiGroup ChatGroup
     * @apiVersion 1.0.0
     * @api {get} /api/v1/:chatRoomId/details to get single Chat Group details.
     * 
     * @apiParam {string} roomId Id of the room to be found. {route params} {required}
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * {
            "error": false,
            "message": "Group found",
            "status": 200,
            "data": {
                "roomId": "XJcDh6h23",
                "roomName": "Friends Group",
                "members": [
                    {
                        "name": "Riya Garg",
                        "Id": "vMFXNXim4"
                    }
                ],
                "status": true,
                "_id": "5b93cd5bd9ccb214644f891e",
                "admin": {
                    "name": "Riya Garg",
                    "Id": "vMFXNXim4"
                },
                "createdOn": "2018-09-08T13:23:39.000Z",
                "__v": 0
            }
        }
     * @apiErrorExample {json} Error-Response:
     * 
     * {
       "error": true,
       "message": string,
       "status": number,
       "data": any
      }   
     */

    app.post(`${baseUrl}/createChatRoom`, roomController.createChatRoom);   
    /**
     * @apiGroup ChatGroup
     * @apiVersion 1.0.0
     * @api {post} /api/v1/createChatRoom to create Chat Group.
     * 
     * @apiParam {string} userEmail email of the user creating chat group. {body params} {required}
     * @apiParam {string} roomName Name of the chat group to be created. {body params} {required}
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     {
            "error": false,
            "message": "Room saved successfully to user details",
            "status": 200,
            "data": {
                "roomId": "fcJGb5_Ro",
                "roomName": "Another group",
                "members": [
                    {
                        "name": "Riya Garg",
                        "Id": "4__a7iYzy"
                    }
                ],
                "status": true,
                "_id": "5b96b17dd821e9199034739a",
                "admin": {
                    "name": "Riya Garg",
                    "Id": "4__a7iYzy"
                },
                "createdOn": "2018-09-10T18:01:33.000Z",
                "__v": 0
            }
        }
     * @apiErrorExample {json} Error-Response:
     * 
     * {
       "error": true,
       "message": string,
       "status": number,
       "data": any
      }
     */


    app.put(`${baseUrl}/:chatRoomId/edit`, roomController.editChatRoom);  
    /**
     * @apiGroup ChatGroup
     * @apiVersion  1.0.0
     * @api {post} /api/v1/room/:chatRoomId/edit to edit Chat Group.
     *
     *
     * @apiParam {string} chatRoomId GroupId of the group to be edited. (route params) (required)
     * @apiParam {string}  roomName  New Name of the group. (body params) (required)
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Room edited Successfully.",
            "status": 200,
            "data": {
                "error": false,
                "message": "Chat Room edited successfully",
                "status": 200,
                "data": {
                    "n": 1,
                    "nModified": 1,
                    "ok": 1
                }
            }
        }
    *  @apiErrorExample {json} Error-Response:
    *
    * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
      }    
    */

    app.post(`${baseUrl}/:chatRoomId/delete`, roomController.deleteChatRoom); 
    /**
         * @apiGroup ChatGroup
         * @apiVersion  1.0.0
         * @api {put} /api/v1/room/:chatRoomId/delete to delete Chat Group.
         *
         *
         * @apiParam {string} chatRoomId GroupId of the group to be deleted. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
           {
                "error": false,
                "message": "Room deleted Successfully.",
                "status": 200,
                "data": {
                    "error": false,
                    "message": "Chat Room deleted",
                    "status": 200,
                    "data": {
                        "n": 1,
                        "ok": 1
                    }
                }
            }
        *  @apiErrorExample {json} Error-Response:
        *
        * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }    
        */

    app.put(`${baseUrl}/:chatRoomId/closeGroup`, roomController.closeChatRoom);
    /**
     * @apiGroup ChatGroup
         * @apiVersion  1.0.0
         * @api {put} /api/v1/room/:chatRoomId/closeGroup to close Chat Group.
         *
         *
         * @apiParam {string} chatRoomId GroupId of the group to be closed. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
         {
                "error": false,
                "message": "Group found & marked close",
                "status": 200,
                "data": {
                    "n": 1,
                    "nModified": 1,
                    "ok": 1
                }
            }
         *  @apiErrorExample {json} Error-Response:
         *
         * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }       
     */

    app.post(`${baseUrl}/joinChatRoom`, roomController.joinChatRoom);
/**
     * @apiGroup ChatGroup
         * @apiVersion  1.0.0
         * @api {put} /api/v1/room/joinChatRoom to close Chat Group.
         *
         *
         * @apiParam {string} chatRoomId GroupId of the group to be joined. (body params) (required)
         * @apiParam {string} userEmail email of the user who has to join the group. (body params) (required)

         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
         {
                "error": false,
                "message": "User & Group Saved",
                "status": 200,
                "data": {
                    "n": 1,
                    "nModified": 1,
                    "ok": 1
                }
            } 
         *  @apiErrorExample {json} Error-Response:
         *
         * {
                "error": true,
                "message": string,
                "status": number,
                "data": any
            }       
     */

    app.post(`${baseUrl}/sendInvite`, roomController.sendInvite);

}
