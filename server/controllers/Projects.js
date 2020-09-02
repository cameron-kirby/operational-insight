/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to Projects module like create,find,update and delete.
 Created On : June 11, 2015
 Last Edited : August 14, 2015
 Last Edited By : Harish Yayi
 */


"use strict"

//var domain = require('../../config/development');
var config = require('config');
var rest_url = config.get('domain.url')

var q = require('q');
var async = require('async');
var _ = require('underscore');
var Model = require('../models/Model');
var Helper = require('../helper/user-manager');
var projectService = require('../services/Projects')


/*
 Author : Harish Yayi
 Description : This is a controller method for creating a new Project
 builds the project document and saves it to the database.
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.add = function (req, res) {
    /*
    resObj format
    It has two attributes status_code and message.
    If the status code is 201, then the new project is created and the url to the resource is set in the location header of the response.
    Else, send the response with error_code and message in JSON response body.
     */
    projectService.addProject(req).then(function (resObj) {
        if (resObj.status_code >= 300) {
            res.status(resObj.status_code).json({'error_code': resObj.status_code, 'message': resObj.message});
            return;
        }
        else if (resObj.status_code == 201) {
            res.status(resObj.status_code).location(rest_url + '/v1/projects/' + resObj.message).send(); //send the json response with the url of the resource in location header
            return;
        }
    });
}


/*
 Author : Harish Yayi
 Description : This is a controller method to delete a particular project.
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.delete = function (req, res) {
    /*
     resObj format
     It has two attributes status_code and message.
     If the status code is 204, then return the response without any body.
     Else, send the response with error_code and message in JSON response body.
     */
    projectService.deleteProject(req).then(function (resObj) {
        if (resObj.status_code >= 300) {
            res.status(resObj.status_code).json({'error_code': resObj.status_code, 'message': resObj.message});
            return;
        }
        else if (resObj.status_code == 204) {
            res.status(resObj.status_code).send();
            return;
        }
    });
}


/*
 Author : Harish Yayi
 Description : This is a controller method to update a particular project.
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.update = function (req, res) {
    /*
     resObj format
     It has two attributes status_code and message.
     If the status code is 204, then return the response without any body.
     Else, send the response with error_code and message in JSON response body.
     */
    projectService.updateProject(req).then(function (resObj) {
        if (resObj.status_code >= 300) {
            res.status(resObj.status_code).json({'error_code': resObj.status_code, 'message': resObj.message});
            return;
        }
        else if (resObj.status_code == 204) {
            res.status(resObj.status_code).location(rest_url + '/v1/projects/' + resObj.message).send(); //send the json response with the url of the resource in location header
            return;
        }
    });
}


/*
 Author : Harish Yayi
 Description : This is a controller method to get details of a particular project
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProject = function (req, res) {
    /*
     resObj format
     It has two attributes status_code and message.
     If the status code is 200, then return the response with project retrieved.
     Else, send the response with error_code and message in JSON response body.
     */
    projectService.getProject(req).then(function (resObj) {
        if (resObj.status_code >= 300) {
            res.status(resObj.status_code).json({'error_code': resObj.status_code, 'message': resObj.message});
            return;
        }
        else if (resObj.status_code == 200) {
            res.status(resObj.status_code).json(resObj.message);
            return;
        }
    });
}

/*
 Author : Harish Yayi
 Description : This is a controller method to get list of projects
 Created On : June 11, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjects = function (req, res) {
    /*
     resObj format
     It has two attributes status_code and message.
     If the status code is 200, then return the response with projects retrieved.
     Else, send the response with error_code and message in JSON response body.
     */
    projectService.getProjects(req).then(function (resObj) {
        if (resObj.status_code >= 300) {
            res.status(resObj.status_code).json({'error_code': resObj.status_code, 'message': resObj.message});
            return;
        }
        else if (resObj.status_code == 200) {
            res.status(resObj.status_code).json(resObj.message);
            return;
        }
    });
}
