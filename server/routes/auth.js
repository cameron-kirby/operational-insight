/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to login, token generation
 Created On : Fri June 11, 2015
 Last Edited : Thu October 15,2015
 Last Edited By : Harish Yayi
 */

var jwt = require('jwt-simple');
var q = require('q')
var Helper = require('../helper/user-manager')
var async = require('async');
var Model = require('../models/Model');
var unirest = require('unirest');
var _ = require('underscore');

var LoginTokenService = require('../modules/loginToken/LoginTokenService');
var loginTokenService = new LoginTokenService();


var auth = {
  login: function (req, res) {
    if (req.body.token) {
      loginUsingToken(req, res);
    } else {
      loginUsingPassword(req, res);
    }
  },

  //finding role to validate the user
  validateUser: function (id) {
    var deferred = q.defer();
    var userObj = {};
    Model.retrieveDocumentsById(Model.Databases.USERS, [id], true).then(function (user) {
      if (user == undefined) { // if the user is undefined return undefined
        deferred.resolve(undefined);
      } else if(user.status.indexOf("Inactive")==0){
        var error = {};
        error.status = 403;
        error.message = 'User status is inactive in the application';
        deferred.reject(error);
      }
      else if (user != undefined) { // else return email id and role
        userObj.id = user._id;
        userObj.role = user.role;
        deferred.resolve(userObj);
      }
    }, function (err) {
      deferred.reject(err);
    });
    return deferred.promise;
  },
  // this method generates the token
  genToken: genToken
}


/**
 * Finds the user's username and password required to login into LDAP.
 *
 * @param {Request} req
 *    The Express request object.
 * @param {Response} res
 *    The Express response object.
 */
function loginUsingPassword(req, res) {
  var header = req.headers['authorization'] || '';     // get the header
  var token = header.split(/\s+/).pop() || '';            // and the encoded auth token
  var auth = new Buffer(token, 'base64').toString();    // convert from base64
  var parts = auth.split(/:/);                       // split on colon
  var id = parts[0].toLowerCase();
  var password = parts[1];
  if (id === '' || password === '') { // check if the id and password is empty
    res.status(401);
    res.json({
      error_code: 401,
      message: 'Invalid credentials',
    });
  }

  // checking if the credentials are valid
  Helper.findUserDetailsAndAuthenticate(id, password).then(function (userFromLdap) {
    authenticationHelperSuccess(res, id, userFromLdap);
  })
    .catch(function (err) {
      authenticationHelperError(res, err);
    });
}

/**
 * Finds the user's username and password required to login into LDAP.
 * This variant uses a supplied login token to attempt to log the user into the system.
 *
 * @param {Request} req
 *    The Express request object.
 * @param {Response} res
 *    The Express response object.
 * @returns {Object}
 *    Returns the user's id and password.
 */
function loginUsingToken(req, res) {
  var userId = req.body.userId;
  var token = req.body.token;

  loginTokenService.verifyToken(userId, token)
    .then(function() {
      Model.retrieveDocumentsById(Model.Databases.USERS, [userId], true).then(function (user) {
        var loginResponse = genToken(userId);
        loginResponse.user.fname = user.fname;
        loginResponse.user.lname = user.lname;
        loginResponse.user.id = userId;

        if (user) {
          if(user.status.indexOf("Inactive") === 0) {
            res.status(403).json({ error_code: 403, message: 'User status is inactive in the application' });
            return;
          } else {
            if (user.role.indexOf('Admin') >= 0) // if Admin assign Admin as role
            {
              loginResponse.user.userRole = 'Admin';
              res.json(loginResponse);
              return;
            }
            else if (user.role.indexOf('Viewer') >= 0) //if Viewer assign Viewer as role
            {
              loginResponse.user.userRole = 'Viewer';
              res.json(loginResponse);
              return;
            }
            else // else assign role as User
            {
              loginResponse.user.userRole = 'User';
              res.json(loginResponse);
              return;
            }
          }
        }

        res.status(403).json({ error_code: 403, message: 'User not in database' });
      })
        .catch(function () {
          res.status(500).json({ error_code: 500, message: 'Could not login, please try again' });
        });
    })
    .catch(function (error) {
      res.status(500).json({ error_code: 500, message: error.message });
    });
}

// setting expiration
function expiresIn(numDays) {
  var dateObj = new Date();
  return dateObj.setDate(dateObj.getDate() + numDays);
}

function genToken(email) {
  var expires = expiresIn(7); // 7 days
  var token = jwt.encode({
    iss: email, // email id
    exp: expires
  }, require('../../config/secret')());

  return {
    token: token,
    user: {
      expires: expires,
      userName: email
    }
  };
}

/**
 * Sends the user's data back since authentication succeeded.
 *
 * @param {Response} res
 *    The Express Response object.
 * @param {User} user
 *    The user's document.
 */
function authenticationHelperSuccess(res, id, userFromLdap) {
  var loginResponse = genToken(id);
  loginResponse.user.fname = userFromLdap.fname;
  loginResponse.user.lname = userFromLdap.lname;

  // check if the user is present in the users database and assign the role accordingly
  Model.retrieveDocumentsById(Model.Databases.USERS, [id], true).then(function (user) {
    if (user) {
      if (user.role.indexOf('Admin') >= 0) {
        loginResponse.user.userRole = 'Admin';
        res.json(loginResponse);
      } else if (user.role.indexOf('Viewer') >= 0) {
        loginResponse.user.userRole = 'Viewer';
        res.json(loginResponse);
      } else {
        loginResponse.user.userRole = 'User';
        res.json(loginResponse);
      }
    } else if (user === undefined) {
      res.status(403).json({ error_code: 403, message: 'User not in database' });
    }
  })
    .catch(function () {
      res.status(500).json({ error_code: 500, message: 'Could not login, please try again' });
    });
}

/**
 * Sends an error response back, since authentication failed.
 *
 * @param {Response} res
 *    The Express Response object.
 * @param {Object} error
 *    The error object.
 */
function authenticationHelperError(res, error) {
  if (error.code === 401) {
    res.status(401)
      .json({
        error_code: 401,
        message: error.message,
      });
  } else {
    res.status(500).json({
      error_code: 500,
      message: error.message,
    });
  }
}

module.exports = auth;