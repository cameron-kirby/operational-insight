/*
 * This is a controller to handle REST services GET, POST, PUT, and DELETE
 *
 * For custom test of REST services see https://www.getpostman.com/collections/7f623b88b59670abf788
 *
 * @author:     Micah Brown << brownsm@us.ibm.com >>
 * @version:    1.0
 * @modified:   July 21st, 2015
 *
 */
//var User = require('../models/Users');
var model = require('../models/Model');
var service = require('../services/Users');
// var dev = require('../../config/development');
var _ = require('underscore');

var async = require('async');
/*
 * Returns with a response of all users in the database. Accepts query parameters for limit, offset,
 * skill, category, proficiency, onVacation, and period [of vacation].
 */

module.exports.findAll = function (req, res) {
    service.findAllUser(req.query, function (response) {
        if (response.status_code==200) {
            return res.status(response.status_code).send(response.message)
        }
        else {
            return res.status(response.status_code).send(response);

        }
    });
};

/*
 * Returns with a response of the user selected. Responds with 404-NotFound if user is not in
 * database. Responds with 200 on success.
 */

module.exports.findOne = function (req, res) {
    service.findOneUser(req.params.id, function (response) {
        if (response.status_code==200) {
            return res.status(response.status_code).send(response.message)
        }
        else {
            return res.status(response.status_code).send(response);
        }
    });
};

/*
 * Inserts a user to the database. If user is already present in the database, responds with a 400
 * error. Certain fields are required, as per the schema. If those fields
 * are omitted, the response will be a validation error. Also updates the skill counts in skill
 * table. Upon successful create, responds with 201 and sets the location header to the new url.
 */

module.exports.add = function (req, res) {
    service.addUser(req.body, req.headers, function (response) {
        if (response.status_code==201) {
            res.location = response.location;
            return res.status(response.status_code).send(null)
        }
        else {
            return res.status(response.status_code).send(response);
        }
    });
};

/*
 * Updates a user in the database. If user is not present in database, responds with a 404 error
 * code. If field that is being updated is not a valid field for user, responds with a 400 error
 * code. Also updates the skill counts in the skills table. Upon successful update, responds with a
 * 204 code. runValidators flag ensures that Mongoose will validate on update (default is to only
 * validate on create). */
module.exports.update = function (req, res) {
    service.updateUser(req.params.id, req.body, req.headers, function (response) {
        if (response.status_code==204) {
            res.location = response.location;
            return res.status(response.status_code).send(null)
        }
        else {
            return res.status(response.status_code).send(response);
        }
    });
};

/*
 * Deletes a user in a database. If user is not present in database, respond with a 404-NotFound
 * error. If user is not an Admin, respond with a 403-Forbidden error. Also updates skill collection
 * to update the counts for the skills. Upon successful delete, respond with a 204 code.
 */

module.exports.delete = function (req, res) {
    service.deleteUser(req.params.id, req.headers, function (response) {
        if (response.status_code==204) {
            return res.status(response.status_code).send(null)
        }
        else {
            return res.status(response.status_code).send(response);
        }
    });
};

/*
 * Searches for a user in a database. No matter the case, this service responds with a 200. 
 * Return true if DB exist in DB, false if otherwise
 */

module.exports.isExist = function (req, res) {
    service.validateUserExist(req.params.id, function (response) {
        if (response.status_code==200) {
            return res.status(response.status_code).send(response.message)
        }
        else {
            return res.status(response.status_code).send(response);
        }
    });
};
