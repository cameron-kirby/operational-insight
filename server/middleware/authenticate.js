/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to authentication and authorization
 Created On : Fri June 11, 2015
 Last Edited : Thu October 2 ,2015
 Last Edited By : Harish Yayi
 */
var jwt = require('jwt-simple');
var validateUser = require('../routes/auth').validateUser;
var logger = require('../helper/Logger');

var LoginTokenService = require('../modules/loginToken/LoginTokenService');
var loginTokenService = new LoginTokenService();


/**
 * Decodes a login token query parameter.
 *
 * @param {String} token
 *    The login token being decoded.
 * @returns {Object}
 *    Returns the login token or undefined if the token wasn't found.
 */
function decodeQueryToken(token) {
  var decodedToken = loginTokenService.decodeToken(token);
  decodedToken.exp = decodedToken.expires;
  decodedToken.iss = decodedToken.userId;
  delete decodedToken.expires;
  delete decodedToken.userId;
  return decodedToken;
}

module.exports = function (req, res, next) {

  var token = req.headers['x-access-token'];
  var queryToken = req.query.token;
  if (token || queryToken) {
    try {
      var decoded = {};
      if (token) {
        decoded = jwt.decode(token, require('../../config/secret.js')());
      } else {
        decoded = decodeQueryToken(queryToken);
      }

      if (decoded.exp <= new Date().getTime()) { // check token expiration
        res.status(401);
        res.json({
          "status": 401,
          "message": "Invalid Token or Key "
        });
        return;
      }
      // Authorize the user to see if s/he can access the resources
      validateUser(decoded.iss).then(function (user) {
        var userObj = {};
        if (user == undefined) userObj = null;
        else {
          userObj.id = user.id;
          userObj.role = user.role;
        }
        if (userObj) {
          // admin related apis
          if ((req.url.indexOf('/admin/') >= 0 && userObj.role.indexOf('Admin') >= 0)) { //case 1 : Check if the user role is Admin and url contains admin
            next(); // To move to next middleware
          }
          // project related apis(create,update,get)
          else if (req.url.indexOf("/projects") >= 0) {
            // Only users with role as either User or Admin can create or update project
            if ((req.method == "PUT" || req.method == "POST") && (userObj.role.indexOf("Viewer") >= 0)) {
              res.status(403);
              res.json({
                "error_code": 403,
                "message": "Not Authorized"
              });
              return;
            }
            else { // get apis
              next();
            }
          }
          // users related apis(create,update,get)
          else if (req.url.indexOf("/users") >= 0) {
            var params = req.params[0];
            var id = params.substr(params.indexOf("/") + 1, params.length - 1);

            // Special case for sub-resources.
            var lastSlashIndex = id.indexOf('/');
            if (lastSlashIndex > -1) {
              id = id.substr(0, lastSlashIndex);
            }

            //Only allow the update to be made by the correct user or by admin
            if (req.method == "PUT" && decoded.iss != id && userObj.role != "Admin") {
              return res.status(403).send({
                'error_code': 403,
                'message': 'Not authorized'
              });
            }
            //Only allow Admin to create a User profile
            else if (req.method == "POST" && userObj.role !== "Admin") {
              return res.status(403).send({
                'error_code': 403,
                'message': 'Not authorized'
              });
            }
            else { // get apis
              next();
            }
          }
          // skills related apis(get)
          else if (req.url.indexOf("/skills") >= 0) {
            // All the create,update,delete are admin related APIs
            if (req.method != "GET") {
              res.status(403).send({
                'error_code': 403,
                'message': 'Not authorized'
              });
              return;
            }
            else { // get APIs
              next();
            }
          }
          // newsfeeds related apis(get)
          else if (req.url.indexOf("/newsfeeds") >= 0) {
            // All the create,update,delete are admin related APIs
            if (req.method != "GET") {
              res.status(403).send({
                'error_code': 403,
                'message': 'Not authorized'
              });
              return;
            }
            else { // get APIs
              next();
            }
          }
          // dropdown api(get)
          else if(req.url.indexOf('/dropdown')>=0)
          {
            next();
          }
          // search api(get)
          else if(req.url.indexOf('/search')>=0)
          {
            next();
          }
          // managers related apis(get)
          else if (req.url.indexOf("/managers") >= 0) {
            // All the create,update,delete are admin related APIs
            if (req.method != "GET") {
              res.status(403).send({
                'error_code': 403,
                'message': 'Not authorized'
              });
              return;
            }
            else { // get APIs
              next();
            }
          }
          else if (req.url.indexOf('/scheduler') >= 0) {
            // Curerntly only allows GET.
            if (req.method !== "GET") {
              res.status(403).send({
                error_code: 403,
                message: 'Not authorized',
              });
            } else {
              next();
            }
          }
          // utilizations related apis(get)
          else if (req.url.indexOf("/utilizations") >= 0) {
            // All the create,update,delete are admin related APIs
            if (req.method != "GET") {
              res.status(403).send({
                error_code: 403,
                message: 'Not authorized',
              });
              return;
            }
            else { // get APIs
              next();
            }
          }
          else {  // if either the User role is not Admin and url contains admin
            res.status(403);
            res.json({
              "error_code": 403,
              "message": "Not Authorized"
            });
            return;
          }
        } else {
          // No user with this name exists, respond back with a 401
          res.status(401);
          res.json({
            "error_code": 401,
            "message": "Invalid User"
          });
          return;
        }
      }, function (err) {
        if(err.status==403){
          res.status(403);
          res.json({
            "error_code": 403,
            "message": err.message
          });
          return;
        }
        else{
          res.status(500);
          res.json({
            "error_code": 500,
            "message": err.errorJSON
          });
          return;
        }
      });
    } catch (err) {
      res.status(500);
      res.json({
        "error_code": 500,
        "message": err.message
      });
      return;
    }
  } else {
    res.status(401);
    res.json({
      "error_code": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};