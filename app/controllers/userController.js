const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const passwordLib = require('./../libs/generatePasswordLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('../libs/checkLib')
const token = require('../libs/tokenLib')
const mailer = require('./../libs/mailerLib');

/* Models */
const AuthModel = mongoose.model('Auth')
const UserModel = mongoose.model('User')


/* Get all user Details */
let getAllUser = (req, res) => {
    UserModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getAllUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller: getAllUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'All User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get all users

/* Get single user details */
let getSingleUser = (req, res) => {
    UserModel.findOne({ 'userId': req.params.userId })
        .select('-password -__v -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'User Controller: getSingleUser', 10)
                let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'User Controller:getSingleUser')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Details Found', 200, result)
                res.send(apiResponse)
            }
        })
}// end get single user


// start user signup function 

let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                } else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)
                            }
                        })
                        let fullName = `${newUser.firstName} ${newUser.lastName}`
                        mailer.autoEmail(newUser.email, `Hello <b>${fullName}</b><br><br>Welcome to Chat-O-Buddy.<br>You can now connect to your friends and create groups with your favourite ones.<br><br> For any Query, drop us a mail at- chatobuddy@gmail.com<br><br>Regards<br>Chat-O-Buddy`);
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

}// end user signup function 



let sendResetLink = (req, res) => {
    if (check.isEmpty(req.params.userEmail)) {
        logger.error("UserEmail is missing", "UserController: logOut", 10);
        let apiResponse = response.generate(true, "UserEmail is missing", 500, null);
        res.send(apiResponse);
    } else {
        UserModel.findOne({ email: req.params.userEmail }, (err, userDetails) => {
            /* handle the error if the user is not found */
            if (err) {
                logger.error('Failed to retrieve user Data', "userController: findUser()", 10);
                let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                res.send(apiResponse);
            }/* if company details is not found */
            else if (check.isEmpty(userDetails)) {
                logger.error("No User Found", "userController: findUser()", 10);
                let apiResponse = response.generate(true, "No user Details Found", 500, null);
                res.send(apiResponse);
            }
            else {
                logger.info("user found", "userController: findUser()", 10);
            mailer.autoEmail(req.params.userEmail, `Hello <b>${userDetails.firstName}</b>!!<br><br>Welcome to Chat-O-Buddy.<br>You can reset your password by<a href='http://localhost:4200/resetPassword/${userDetails.userId}'>clicking here</a> .<br><br>For any Query, drop us a mail at- chatobuddy@gmail.com<br><br>Regards<br>Chat-O-Buddy `);
                let apiResponse = response.generate(false, "User Details Found", 200, "Mail sent successfully");
                res.send(apiResponse); 
            }
        });
    }
}//sendResetLink

let resetPassword = (req, res) => {

    let findUser = () => {

        return new Promise((resolve, reject) => {
            if (req.body.userId) {
                UserModel.findOne({ userId: req.body.userId }, (err, userDetails) => {
                    /* handle the error if the user is not found */
                    if (err) {
                        logger.error('Failed to retrieve user Data', "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }/* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "userController: findUser()", 10);
                        resolve(userDetails);
                    }
                });
            }
            else {
                let apiResponse = response.generate(true, "UserId parameter is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findUser()

    let updatePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.password)) {
                logger.error("password is missing", "UserController: logOut", 10);
                let apiResponse = response.generate(true, "Password is missing", 500, null);
                reject(apiResponse);
            } else {
                UserModel.update({ userId: req.body.userId }, { password: passwordLib.hashpassword(req.body.password) }, { multi: true }, (err, result) => {

                    if (err) {
                        logger.error("Failed to change Password ", "userController: resetPassword", 10);
                        let apiResponse = response.generate(true, "Failed to change Password", 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(result)) {
                        logger.error("User Not found", "userController: resetPassword", 10);
                        let apiResponse = response.generate(true, "User not found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("Password updated", "userController: resetPassword", 10);
                        mailer.autoEmail(userDetails.email, `<b> Hi ${userDetails.firstName} ${userDetails.lastName},<br><br> Your password has been changed succesfully.</b><br><br>For any Query, drop us a mail at- chatobuddy@gmail.com<br><br>Regards<br>Chat-O-Buddy`);
                        resolve("Password reset successfull");
                    }
                });
            }
        });
    }//end update password

    findUser(req, res)
        .then(updatePassword)
        .then((message) => {
            let apiResponse = response.generate(false, "Mail sent Successfully", 200, message);
            res.status(200);
            res.send(apiResponse);
        })
        .catch((err) => {
            res.status(err.status);
            res.send(err);
        });


}//end reset password


// start of login function 
let loginFunction = (req, res) => {
    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email}, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });
               
            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.error('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 500, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }
    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }

    findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
}



// end of the login function 


/**
 * function to logout user.
 * auth params: userId.
 */
let logout = (req, res) => {
  AuthModel.remove({userId: req.params.userId}, (err, result) => {
    if (err) {
        console.log(err)
        logger.error(err.message, 'user Controller: logout', 10)
        let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
        res.send(apiResponse)
    } else if (check.isEmpty(result)) {
        let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
        res.send(apiResponse)
    } else {
        let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
        res.send(apiResponse)
    }
  })
} // end of the logout function.

let deleteUserAccount = (req, res) => {
    let findUser = () => {

        return new Promise((resolve, reject) => {
            if (req.params.userId) {
                UserModel.findOne({ userId: req.params.userId }, (err, userDetails) => {
                    /* handle the error if the user is not found */
                    if (err) {
                        logger.error('Failed to retrieve user Data', "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    }/* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController: findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 500, null);
                        reject(apiResponse);
                    }
                    else {
                        logger.info("user found", "userController: findUser()", 10);
                        resolve(userDetails);
                    }
                });
            }
            else {
                let apiResponse = response.generate(true, "UserId parameter is missing", 500, null);
                reject(apiResponse);
            }
        });
    }//end findUser()

 let deleteUser = () => {
    return new Promise((resolve, reject) => {
            UserModel.remove({userId: req.params.userId}, (err, result) => {
            if (err) {
                console.log(err)
                logger.error(err.message, 'user Controller: deleteUserAccount()', 10)
                let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
                reject(apiResponse)
            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, 'Already deleted or Invalid UserId', 404, null)
                reject(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User Account deleted Successfully', 200, result)
                resolve(apiResponse)
            }
            })
    });
       }// end of deleteUser 
  
  
       findUser(req,res)
       .then(deleteUser)
       .then((result) => {
           let apiResponse = response.generate(false, 'Account deletion Successful', 200, result)
           res.send(apiResponse)
       })
       .catch((err) => {
           console.log(err);
           res.status(err.status)
           res.send(err)
       })
  
  
    } // end of the logout function.


module.exports = {

    signUpFunction: signUpFunction,
    getAllUser: getAllUser,
    getSingleUser: getSingleUser,
    loginFunction: loginFunction,
    logout: logout,
    resetPassword: resetPassword,
    sendResetLink: sendResetLink,
    deleteUserAccount: deleteUserAccount

}// end exports