/*
 Author : Harish Yayi
 Description : This file contains the project status API functionality.
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
 Description : This method is for creating project status in the project_status database in cloudant
 Created On : September 6, 2015
 Last Edited : September 39,2015
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
    //building the project status document
    var statusDoc = {
        name: req.body.name,
        description: (!_.isEmpty(req.body.description)) ? req.body.description : undefined,
        created_by: decoded.iss, // project status created by
        created_date: new Date().getTime() // project status created date
    }
    // insert the document in the project_status database in cloudant
    Model.insertDocument(Model.Databases.PROJECT_STATUS, statusDoc).then(function (doc) {
        // if successfully inserted
        if (doc._id) {
            res.status(201).location(domain.domain.url + '/v1/admin/projectstatus/' + doc._id).send();
            return;
        }
        else {
            res.status(500).json({'error_code': 500, 'message': 'Could not create the project status'});
            return;
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not create the project status'});
        return;
    });
}

/*
 Author : Harish Yayi
 Description : This method is for deleting a particular project status from the project_status database in cloudant
 Created On : September 6, 2015
 Last Edited : September 29,2015
 Last Edited By : Harish Yayi
 */
module.exports.delete = function (req, res) {

    var id = req.params.projectStatusId; // project status id
    Model.retrieveDocumentsById(Model.Databases.PROJECT_STATUS, [id], true).then(function (projectStatusDoc) {
        if (projectStatusDoc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project Status not found'});
            return;
        }
        else {
            var rev = projectStatusDoc._rev;
            Model.destroyDocument(Model.Databases.PROJECT_STATUS, id, rev).then(function (doc) {
                if (doc.ok) { // if project status deleted from project_status database
                    res.status(204).send();
                    return;
                }
                else {
                    res.status(500).json({'error_code': 500, 'message': 'Project Status could not be deleted'});
                    return;
                }
            }, function (err) {
                res.status(500).json({'error_code': 500, 'message': 'Project Status could not be deleted'});
                return;
            });
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Project Status could not be retrieved'});
        return;
    });

}

/*
 Author : Harish Yayi
 Description : This method is for retrieving a particular project status details
 Created On : October 1, 2015
 Last Edited : October 1,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectStatus = function (req, res) {
    var id = req.params.projectStatusId; //get the project status ID from the url
    Model.retrieveDocumentsById(Model.Databases.PROJECT_STATUS, [id], true).then(function (doc) { // get project status details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project status not found'});
            return;
        }
        else {
            res.status(200).json({
                "kind": "Resource#ProjectStatusDetails",
                "item": doc
            });
            return;
        }
    });
}

/*
 Author : Harish Yayi
 Description : This method is for retrieving all the project statuses from project_status database
 Created On : October 6, 2015
 Last Edited : October 6,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectStatuses = function (req, res) {
    var limit = req.query.limit;
    var offset = req.query.offset;
    var projectStatusesDoc = {};
    projectStatusesDoc.kind = "Resource#ProjectStatusesList";
    projectStatusesDoc.items = [];
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

    Model.queryDocuments(Model.Databases.PROJECT_STATUS, query).then(function (documents) {
        projectStatusesDoc.items = documents.docs;
        res.status(200).json(projectStatusesDoc);
        return;
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not retrieve project statuses'});
        return;
    });
}

/*
 Author : Caesar Cavales
 Description : This method is for updating all the project statuses from project_status, projects, and utilizations database
 Created On : November 10, 2015
 Last Edited : November 10, 2015
 Last Edited By : Caesar Cavales
*/
module.exports.updateProjectStatus = function (req, res) {
    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    var id = req.params.projectStatusId; //get the project status ID from the URL

    Model.retrieveDocumentsById(Model.Databases.PROJECT_STATUS, [id], true).then(function (doc) { //get the project status details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project status not found'});
            return;
        }
        else {
            //build the project status document
            var project_status = {};
            project_status.name = (req.body.name) ? req.body.name : doc.name;
            project_status.description = (req.body.description) ? req.body.description : doc.description;
            project_status.created_by = doc.created_by;
            project_status.created_date = doc.created_date;
            project_status.modified_by = decoded.iss; // modified by
            project_status.modified_date = new Date().getTime(); // modified date
            
            //update project status
            Model.insertDocument(Model.Databases.PROJECT_STATUS, project_status, id, doc._rev).then(function (resProjStatus) {
                if (resProjStatus._id) {
                    res.status(201).location(domain.domain.url + '/v1/admin/projectstatus/' + doc._id).send();
                    
                    //only update project and utilization databases if the project status name has been changed
                    //since project status ID is not supplied in the DB, this code would assume that project status in both projects and utilizations DB are updated regulary
                    if (resProjStatus.name != doc.name) {
                        var queryProjects = {selector: {status: doc.name}};
                        Model.queryDocuments(Model.Databases.PROJECTS, queryProjects).then(function (docs) {
                            // if this particular project status description is present in the projects database, update them as well
                            if (docs.docs.length > 0) {
                                var projectStatusDocs = [];
                                _.each(docs.docs, function (projStatus) {
                                    projStatus.status = project_status.name;
                                    projectStatusDocs.push(projStatus);

                                    //model query documents from here
                                });

                                Model.bulk(Model.Databases.PROJECTS, {"docs": projectStatusDocs}).then(function (result) {
                                    res.status(204).send();
                                    return;
                                }, function (err) {
                                    // if error
                                    Model.destroyDocument(Model.Databases.PROJECTS, resProjStatus._id, resProjStatus._rev).then(function (resDoc) {
                                        if (resDoc.ok) {
                                            delete doc._rev;
                                            Model.insertDocument(Model.Databases.PROJECTS, doc).then(function (reInsertedProjStatus) {
                                                if (reInsertedProjStatus._id) {
                                                    res.status(500).json({'error_code': 500, 'message': 'Could not update project document'});
                                                    return;
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else {  // if this particular project id is not present in the project database, just send the response
                                res.status(204).send();
                                return;
                            }
                        }, function (err) {
                            res.status(500).json({'error_code': 500, 'message': 'Could not update project document'});
                            return;
                        });

                        //update utilizations table
                        var queryUtilizations = {selector: {_id: {$gt: 0}, 'projects': {$elemMatch: {'utilization': {$elemMatch: {'status': doc.name}}}}}};
                        // var queryUtilizations = {selector: {_id: {$gt: 0}, 'projects': {$elemMatch: {'proj_id': projStatus._id}}}};
                        Model.queryDocuments(Model.Databases.UTILIZATIONS, queryUtilizations).then(function (utilDocs) {
                            if (utilDocs.docs.length > 0) {
                                var utilStatusDocs = [];
                                _.each(utilDocs.docs, function (utilStatus) {
                                    //if project status is equal the old name, then update
                                    utilStatus.projects.forEach(function (utilProject) {
                                        // if (utilProject.status == doc.name) {
                                        //     utilProject.status = project_status.name;

                                            //if utilization status is equal the old name, then update 
                                            utilProject.utilization.forEach(function (utilUtilization) {
                                                utilUtilization.status = project_status.name;
                                            })

                                            utilStatusDocs.push(utilStatus);
                                        // }
                                    });
                                });

                                Model.bulk(Model.Databases.UTILIZATIONS, {"docs": utilStatusDocs}).then(function (result) {
                                    res.status(204).send();
                                    return;
                                }, function (err) {
                                    // if error
                                    Model.destroyDocument(Model.Databases.UTILIZATIONS, resProjStatus._id, resProjStatus._rev).then(function (resDoc) {
                                        if (resDoc.ok) {
                                            delete doc._rev;
                                            Model.insertDocument(Model.Databases.UTILIZATIONS, doc).then(function (reInsertedProjStatus) {
                                                if (reInsertedProjStatus._id) {
                                                    res.status(500).json({'error_code': 500, 'message': 'Could not update utilization document'});
                                                    return;
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                            else {  // if this particular project id is not present in the utilizations database, just send the response
                                res.status(204).send();
                                return;
                            }
                        }, function (err) {
                            res.status(500).json({'error_code': 500, 'message': 'Could not update utilizations document'});
                            return;
                        });
                    }
                    else {  // if this particular project_status id is not present in the project_status database, just send the response
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