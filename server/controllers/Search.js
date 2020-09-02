/*
 Author : Harish Yayi
 Description : This file contains the search API functionality.
 Created On : August 14, 2015
 Last Edited : February 19, 2016
 Last Edited By : Harish Yayi
 */

var Model = require('../models/Model');
var q = require('q');
var async = require('async');
var _ = require('underscore');
var logger = require('../helper/Logger');


/*
 Author : Harish Yayi
 Description : This method is for retrieving both projects and users from the cloudant database
 based on the parts parameter provided in the url.
 Created On : August 5, 2015
 Last Edited : February 19,2016
 Last Edited By : Harish Yayi
 */
module.exports.searchProjectsPeopleSkills = function (req, res) {
    var responseDoc = {};
    responseDoc.kind = "Resource#SearchList"
    responseDoc.items = {};
    var parts = req.query.parts;
    var query = req.query.query;
    var manager = req.query.manager;

    //validations
    if (_.isEmpty(manager)) {
        manager = "all"; // if manager id is not passed in the url, default it to all
    }
    if (_.isEmpty(query)) {
        res.status(400).json({'error_code': 400, 'message': 'Please specify the query'});
        return;
    }
    if (req.query.parts == undefined || parts == '' || parts.indexOf('()') >= 0) //validate parts
    {
        parts = 'projects,users,skills';
    }
    else {  // validate parts
        var preDefinedParts = ["projects", "users", "skills"];
        var temp = parts.substring(1, parts.length - 1).split(",");
        var errCount = 0;
        temp = temp.sort();
        for (var i = 0; i < temp.length; i++) {
            if (preDefinedParts.indexOf(temp[i]) < 0) {
                errCount++;
            }
        }
        if (temp.length > 3 || temp.length == 0 || errCount > 0) {
            res.status(400).json({'error_code': 400, 'message': 'Please specify the parts parameter properly'});
            return;
        }
    }

    //replace lucene escape characters
    //we do not escape * or ? because the user can use them to search
    query.replace(/([\!\+\&\|\(\)\[\]\{\}\^\~\:\"])/g, "\\$1");

    query = query + '*';

    function searchProjects() {
        var deferred = q.defer();
        var projects = [];
        if (parts.indexOf("projects") >= 0) {
            //lucene search query
            if (manager == "all") {
                var queryString = '(name :' + query + ' OR ' + 'description:' + query + ' OR ' + 'process:' + query + ')';
            }
            else {
                var queryString = '(name :' + query + ' OR ' + 'description:' + query + ' OR ' + 'process:' + query + ')' + ' AND ' + 'manager:' + manager;
            }
            Model.searchDocuments(Model.Databases.PROJECTS, queryString, 'searchProjects', {'include_fields': ['proj_id', 'name', 'description', 'process', 'status']}).then(function (documents) {
                _.each(documents.rows, function (row) {
                    projects.push(row.fields);
                });
                deferred.resolve(projects);
            }, function (err) {
                logger.log('error', 'Error in searchProjectsPeopleSkills method in Search Controller(projects)' + '---' + err.message);
                deferred.resolve(projects);
            });
        }
        else {
            deferred.resolve(projects);
        }
        return deferred.promise;
    }

    function searchUsers() {
        var deferred = q.defer();
        var users = [];
        if (parts.indexOf("users") >= 0) {
            //lucene search query
            if (manager == "all") {
                var queryString = '(email :' + query + ' OR ' + 'fname:' + query + ' OR ' + 'lname:' + query + ' OR ' + 'job_title:' + query + ')';
            }
            else {
                var queryString = '(email :' + query + ' OR ' + 'fname:' + query + ' OR ' + 'lname:' + query + ' OR ' + 'job_title:' + query + ')' + ' AND ' + 'reports_to:' + manager;
            }
            Model.searchDocuments(Model.Databases.USERS, queryString, 'searchUsers', {'include_fields': ['email', 'fname', 'lname', 'reports_to', 'job_title']}).then(function (documents) {
                _.each(documents.rows, function (row) {
                    users.push(row.fields);
                });
                deferred.resolve(users);
            }, function (err) {
                logger.log('error', 'Error in searchProjectsPeopleSkills method in Search Controller(users)' + '---' + err.message);
                deferred.resolve(users);
            });
        }
        else {
            deferred.resolve(users);
        }
        return deferred.promise;

    }

    function searchSkills() {
        var deferred = q.defer();
        var skills = [];
        if (parts.indexOf("skills") >= 0) {
            //lucene search query
            if (manager == "all") {
                var queryString = '(name :' + query + ' OR ' + 'description:' + query + ' OR ' + 'category:' + query + ')';
            }
            else {
                var queryString = '(name :' + query + ' OR ' + 'description:' + query + ' OR ' + 'category:' + query + ')' + ' AND ' + 'manager:' + manager;
            }
            Model.searchDocuments(Model.Databases.SKILLS, queryString, 'searchSkills', {'include_fields': ['skill_id', 'name', 'description', 'category_id', 'category']}).then(function (documents) {
                var skills = [];
                _.each(documents.rows, function (row) {
                    skills.push(row.fields);
                });
                deferred.resolve(skills);
            }, function (err) {
                logger.log('error', 'Error in searchProjectsPeopleSkills method in Search Controller(skills)' + '---' + err.message);
                deferred.resolve(skills);
            });
        }
        else {
            deferred.resolve(skills);
        }
        return deferred.promise;
    }

    q.all([
        searchProjects(),
        searchUsers(),
        searchSkills()
    ]).then(function (data) {
        responseDoc.items.projects = data[0];
        responseDoc.items.users = data[1];
        responseDoc.items.skills = data[2];
        res.status(200).json(responseDoc);
        return;

    }).catch(function (err) {
        res.status(500).json({'error_code': 500, 'message': err.message});
        return;
    });


}