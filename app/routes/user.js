const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;


    app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUser);


    app.get(`${baseUrl}/:userId/details`, auth.isAuthorized, userController.getSingleUser);
/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/:userId/details api for single user details.
     *
     * @apiParam {string} userId userId of the user. (query params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     {
            "error": false,
            "message": "User Details Found",
            "status": 200,
            "data": {
                "userId": "esf4jgXzX",
                "firstName": "mamta",
                "lastName": "agarwal",
                "email": "mamta@gmail.com",
                "mobileNumber": 8561852430,
                "createdOn": "2018-09-05T05:05:37.000Z",
                "groups": [
                    "XwSIUNSvs",
                    "TAFsa-xqV",
                    "XJcDh6h23"
                ]
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

    app.post(`${baseUrl}/signup`, userController.signUpFunction);
 /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup api for user signup.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} firstName First Name of the user. (body params) (required)
     * @apiParam {string} lastName Last Name of the user. (body params) (required)
     * @apiParam {string} mobileNumber Mobile Number of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "User created",
            "status": 200,
            "data": {
                "userId": "IanhVthCk",
                "firstName": "Piyush",
                "lastName": "Mittal",
                "email": "piyushmittal41997@gmail.com",
                "mobileNumber": 7355173455,
                "createdOn": "2018-09-10T14:34:24.000Z",
                "groups": [],
                "_id": "5b9680f00efbde2414a8e39d",
                "__v": 0
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
   

    app.post(`${baseUrl}/login`, userController.loginFunction);
     /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
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

    app.post(`${baseUrl}/:userId/logout`, auth.isAuthorized, userController.logout);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/:userId/logout to logout user.
         *
         * @apiParam {string} userId userId of the user. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
            {
                "error": false,
                "message": "Logged Out Successfully",
                "status": 200,
                "data": null
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

    app.get(`${baseUrl}/:userEmail/forgotPassword`, userController.sendResetLink);
    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {get} /api/v1/users/:userEmail/forgotPassword to send an reset email to user.
         *
         * @apiParam {string} userEmail Email of the user. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "User Details Found",
                    "status": 200,
                    "data": "Mail sent successfully"
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


    app.post(`${baseUrl}/resetPassword`, userController.resetPassword);

    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/resetPassword to change the password of user.
         *
         * @apiParam {string} userId Id of the user. (body params) (required)
         * @apiParam {string} password New password of the user. (body params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "Mail sent Successfully",
                    "status": 200,
                    "data": "Password reset successfull."
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
       app.post(`${baseUrl}/:userId/delete`, auth.isAuthorized, userController.deleteUserAccount);
       /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/:userId/delete to delete Chat Group.
         *
         *
         * @apiParam {string} userId userId of the user account to be deleted. (route params) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
          {
                "error": false,
                "message": "Account deletion Successful",
                "status": 200,
                "data": {
                    "error": false,
                    "message": "User Account deleted Successfully",
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

}
