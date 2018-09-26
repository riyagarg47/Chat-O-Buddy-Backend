const express = require('express');
const router = express.Router();
const chatController = require("./../../app/controllers/chatController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

  let baseUrl = `${appConfig.apiVersion}/chat`;

  app.get(`${baseUrl}/get/for/user`, chatController.getUsersChat);

  /**
   * @apiGroup chat
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/get/for/user to get paginated chats of user.
   * 
   * @apiParam {string} senderId userId of logged in user. (query params) (required)
   * @apiParam {string} receiverId userId receiving user. (query params) (required)
   * @apiParam {number} skip skip value for pagination. (query params) (optional)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "All Chats Listed",
        "status": 200,
        "data": [
          {
            "chatId": "IELO6EVjx",
            "modifiedOn": "2018-03-05T15:36:31.026Z",
            "createdOn": "2018-03-05T15:36:31.025Z",
            "message": "hello .. .. mamta",
            "receiverId": "-E9zxTYA8",
            "receiverName": "Riya Garg",
            "senderId": "-cA7DiYj5",
            "senderName": "mamta agarwal"
          },
          {
            "chatId": "ZcaxtEXPT",
            "modifiedOn": "2018-03-05T15:36:39.548Z",
            "createdOn": "2018-03-05T15:36:39.547Z",
            "message": "hello riya .. .. .. ",
            "receiverId": "-cA7DiYj5",
            "receiverName": "mamta agarwal",
            "senderId": "-E9zxTYA8",
            "senderName": "Riya Garg"
          },
          .........................
        ]

      }
 */


  app.get(`${baseUrl}/for/group`, chatController.getGroupChat);
 /**
   * @apiGroup chat
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chat/for/group to get the group chat.
   *
   * @apiParam {string} chatRoomId Room Id of the chat group. (query params) (required)
   * @apiParam {string} skip page value of group chat. (query params) (optional)
   *
   * @apiSuccess {object} myResponse shows error status, message, http status code, result.
   * 
   * @apiSuccessExample {object} Success-Response:
      {
          "error": false,
          "message": "All Group Chats Listed",
          "status": 200,
          "data": [
              {
                  "chatId": "S1SjOhOXQ",
                  "createdOn": "2018-07-15T12:05:49.077Z",
                  "message": "Hello in another group",
                  "senderId": "H1_zVTeXX",
                  "senderName": "Riya Garg"
              },
              {
                  "chatId": "rk43d3dQm",
                  "createdOn": "2018-07-15T12:06:03.899Z",
                  "message": "Hi in another group",
                  "senderId": "SJNYFW8Q7",
                  "senderName": "Piyush Mittal"
              }
          ]
      }
  *  @apiErrorExample {json} Error-Response:
  *
  *  {
          "error": true,
          "message": string,
          "status": number,
          "data": any
      }    
  */
  
 

}
