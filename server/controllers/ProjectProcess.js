/*
 Author : Harish Yayi
 Description : This file contains the project process API functionality.
 Created On : September 6, 2015
 Last Edited : October 2, 2015
 Last Edited By : Harish Yayi
 */

var Model = require('../models/Model');
var q = require('q');
var async = require('async');
var domain = require('../../config/development');
var _ = require('underscore');
var jwt = require('jwt-simple');



/*
 Author : Harish Yayi
 Description : This method is for creating project process in the project_process database in cloudant
 Created On : September 6, 2015
 Last Edited : September 30,2015
 Last Edited By : Harish Yayi
 */
module.exports.add = function (req, res) {
    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    // validation
    if (_.isEmpty(req.body.name)) {
        res.status(400).json({'error_code': 400, 'message': 'Name cannot be empty'});
        return;
    }
    //building the project process document
    var processDoc = {
        name: req.body.name,
        description: (!_.isEmpty(req.body.description)) ? req.body.description : undefined,
        created_by: decoded.iss, // project process created by
        created_date: new Date().getTime() // project process created date
    }
    // insert the document in the project_process database in cloudant
    Model.insertDocument(Model.Databases.PROJECT_PROCESS, processDoc).then(function (doc) {
        // if successfully inserted
        if (doc._id) {
            res.status(201).location(domain.domain.url + '/v1/admin/projectprocess/' + doc._id).send();
            return;
        }
        else {
            res.status(500).json({'error_code': 500, 'message': 'Could not create the project process'});
            return;
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not create the project process'});
        return;
    })

}

/*
 Author : Harish Yayi
 Description : This method is for deleting a particular project process from the project_process database in cloudant
 Created On : September 6, 2015
 Last Edited : September 30,2015
 Last Edited By : Harish Yayi
 */
module.exports.delete = function (req, res) {

    var id = req.params.projectProcessId; // project process id
    Model.retrieveDocumentsById(Model.Databases.PROJECT_PROCESS, [id], true).then(function (projectProcessDoc) {
        if (projectProcessDoc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Job Role not found'});
            return;
        }
        else {
            var rev = projectProcessDoc._rev;
            Model.destroyDocument(Model.Databases.PROJECT_PROCESS, id, rev).then(function (doc) {
                if (doc.ok) { // if project process deleted from project_process database
                    res.status(204).send();
                    return;
                }
                else {
                    res.status(500).json({'error_code': 500, 'message': 'Project Process could not be deleted'});
                    return;
                }
            }, function (err) {
                res.status(500).json({'error_code': 500, 'message': 'Project Process could not be deleted'});
                return;
            });
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Project process could not be retrieved'});
        return;
    });
}

/*
 Author : Harish Yayi
 Description : This method is for retrieving a particular project process details
 Created On : October 1, 2015
 Last Edited : October 1,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectProcess = function (req, res) {
    var id = req.params.projectProcessId; //get the project process ID from the url
    Model.retrieveDocumentsById(Model.Databases.PROJECT_PROCESS, [id], true).then(function (doc) { // get project process details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project process not found'});
            return;
        }
        else {
            res.status(200).json({
                "kind": "Resource#ProjectProcessDetails",
                "item": doc
            });
            return;
        }
    });
}

/*
 Author : Harish Yayi
 Description : This method is for retrieving all the project processes from project_process database
 Created On : October 6, 2015
 Last Edited : October 6,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectProcesses = function (req, res) {
    var limit = req.query.limit;
    var offset = req.query.offset;
    var projectProcessesDoc = {};
    projectProcessesDoc.kind = "Resource#ProjectProcessesList";
    projectProcessesDoc.items = [];
    // validations
    if (offset == undefined || offset == '') {
        offset = 0; // defaulted to 0 if not provided
    }
    if (isNaN(offset)) {
        res.status(400).json({
            'error_code': 400,
            'message': 'Please specify offset as a positive integer greater than or equal to 0'
        });
        return;
    }
    //query categories from categories DB
    var query = {
        selector: {name: {$regex: "^.*"}},
        limit: (limit==undefined || isNaN(limit) || limit=='') ? undefined : parseInt(limit),
        skip: parseInt(offset)
    };

    Model.queryDocuments(Model.Databases.PROJECT_PROCESS, query).then(function (documents) {
        projectProcessesDoc.items = documents.docs;
        res.status(200).json(projectProcessesDoc);
        return;
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not retrieve project processes'});
        return;
    });
}

/*
 Author : Caesar Cavales
 Description : This method is for updating all the project processes from project_process, and projects database
 Created On : November 10, 2015
 Last Edited : November 10, 2015
 Last Edited By : Caesar Cavales
*/
module.exports.updateProjectProcess = function (req, res) {
    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    var id = req.params.projectprocessId; //get the project process ID from the URL

    Model.retrieveDocumentsById(Model.Databases.PROJECT_PROCESS, [id], true).then(function (doc) { //get the project process details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project process not found'});
            return;
        }
        else {
            //build the project process document
            var project_process = {};
            project_process.name = (req.body.name) ? req.body.name : doc.name;
            project_process.description = (req.body.description) ? req.body.description : doc.description;
            project_process.created_by = doc.created_by;
            project_process.created_date = doc.created_date;
            project_process.modified_by = decoded.iss; // modified by
            project_process.modified_date = new Date().getTime(); // modified date
            
            //update project process
            Model.insertDocument(Model.Databases.PROJECT_PROCESS, project_process, id, doc._rev).then(function (resProjProcess) {
                if (resProjProcess._id) {
                    res.status(201).location(domain.domain.url + '/v1/admin/projectprocess/' + doc._id).send();
                    
                    //only update project and utilization databases if the project process name has been changed
                    //since project process ID is not supplied in the DB, this code would assume that project process in both projects and utilizations DB are updated regulary
                    if (resProjProcess.name != doc.name) {
                        var queryProjects = {selector: {$text: doc.name}};
                        Model.queryDocuments(Model.Databases.PROJECTS, queryProjects).then(function (docs) {
                            // if this particular project process description is present in the projects database, update them as well
                            if (docs.docs.length > 0) {
                                var projectProcessDocs = [];
                                _.each(docs.docs, function (projProcess) {
                                    if (projProcess.process.toLowerCase() == doc.name.toLowerCase()) {
                                        projProcess.process = project_process.name;
                                        projectProcessDocs.push(projProcess);
                                    }
                                });

                                Model.bulk(Model.Databases.PROJECTS, {"docs": projectProcessDocs}).then(function (result) {
                                    res.status(204).send();
                                    return;
                                }, function (err) {
                                    // if error
                                    Model.destroyDocument(Model.Databases.PROJECTS, resProjProcess._id, resProjProcess._rev).then(function (resDoc) {
                                        if (resDoc.ok) {
                                            delete doc._rev;
                                            Model.insertDocument(Model.Databases.PROJECTS, doc).then(function (reInsertedprojProcess) {
                                                if (reInsertedprojProcess._id) {
                                                    res.status(500).json({'error_code': 500, 'message': 'Could not update project document'});
                                                    return;
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else {  // if this particular project id is not present in the projects database, just send the response
                                res.status(204).send();
                                return;
                            }
                        }, function (err) {
                            res.status(500).json({'error_code': 500, 'message': 'Could not update project document'});
                            return;
                        });
                    }
                    else {  // if this particular project_process id is not present in the project_process database, just send the response
                        res.status(204).send();
                        return;
                    }
                }
                else {
                    res.status(500).json({'error_code': 500, 'message': 'Could not save project statuss'});
                    return;  
                }
            }, function (err) {
                res.status(500).json({'error_code': 500, 'message': 'Could not retrieve project statuse'});
                return;
            });
        }
    });
}
