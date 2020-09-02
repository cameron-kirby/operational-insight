/*
 Author : Harish Yayi
 Description : This file contains the project geo API functionality.
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
 Description : This method is for creating project geo in the project_geo database in cloudant
 Created On : September 6, 2015
 Last Edited : September 29,2015
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
    //building the project geo document
    var geoDoc = {
        name: req.body.name,
        description: (!_.isEmpty(req.body.description)) ? req.body.description : undefined,
        created_by: decoded.iss, // project geo created by
        created_date: new Date().getTime() // project geo created date
    }
    // insert the document in the project_geo database in cloudant
    Model.insertDocument(Model.Databases.PROJECT_GEO, geoDoc).then(function (doc) {
        // if successfully inserted
        if (doc._id) {
            res.status(201).location(domain.domain.url + '/v1/admin/projectgeo/' + doc._id).send();
            return;
        }
        else {
            res.status(500).json({'error_code': 500, 'message': 'Could not create the project geo'});
            return;
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not create the project geo'});
        return;
    })

}

/*
 Author : Harish Yayi
 Description : This method is for deleting a particular project geo from the project_geo database in cloudant
 Created On : September 6, 2015
 Last Edited : September 29,2015
 Last Edited By : Harish Yayi
 */
module.exports.delete = function (req, res) {
    var id = req.params.projectGeoId; // project geo id
    Model.retrieveDocumentsById(Model.Databases.PROJECT_GEO, [id], true).then(function (projectGeoDoc) {
        if (projectGeoDoc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project Geo not found'});
            return;
        }
        else {
            var rev = projectGeoDoc._rev;
            Model.destroyDocument(Model.Databases.PROJECT_GEO, id, rev).then(function (doc) {
                if (doc.ok) { // if project geo deleted from project_geo database
                    res.status(204).send();
                    return;
                }
                else {
                    res.status(500).json({'error_code': 500, 'message': 'Project Geo could not be deleted'});
                    return;
                }
            }, function (err) {
                res.status(500).json({'error_code': 500, 'message': 'Project Geo could not be deleted'});
                return;
            });
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Project Geo could not be retrieved'});
        return;
    });
}

/*
 Author : Harish Yayi
 Description : This method is for retrieving a particular project geo details
 Created On : October 1, 2015
 Last Edited : October 1,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectGeo = function (req, res) {
    var id = req.params.projectGeoId; //get the project geo ID from the url
    Model.retrieveDocumentsById(Model.Databases.PROJECT_GEO, [id], true).then(function (doc) { // get project geo details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project Geo not found'});
            return;
        }
        else {
            res.status(200).json({
                "kind": "Resource#ProjectGeoDetails",
                "item": doc
            });
            return;
        }
    });
}


/*
 Author : Harish Yayi
 Description : This method is for retrieving all the project geos from project_geo database
 Created On : October 6, 2015
 Last Edited : October 6,2015
 Last Edited By : Harish Yayi
 */
module.exports.getProjectGeos = function (req, res) {
    var limit = req.query.limit;
    var offset = req.query.offset;
    var projectGeosDoc = {};
    projectGeosDoc.kind = "Resource#ProjectGeosList";
    projectGeosDoc.items = [];
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

    Model.queryDocuments(Model.Databases.PROJECT_GEO, query).then(function (documents) {
        projectGeosDoc.items = documents.docs;
        res.status(200).json(projectGeosDoc);
        return;
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not retrieve project geos'});
        return;
    });
}

/*
 Author : Caesar Cavales
 Description : This method is for updating all the project geos from project_geo, and projects database
 Created On : November 10, 2015
 Last Edited : November 10, 2015
 Last Edited By : Caesar Cavales
*/
module.exports.updateProjectGeos = function (req, res) {
    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    var id = req.params.projectGeoId; //get the project geo ID from the URL

    Model.retrieveDocumentsById(Model.Databases.PROJECT_GEO, [id], true).then(function (doc) { //get the project geo details
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Project geo not found'});
            return;
        }
        else {
            //build the project geo document
            var project_geo = {};
            project_geo.name = (req.body.name) ? req.body.name : doc.name;
            project_geo.description = (req.body.description) ? req.body.description : doc.description;
            project_geo.created_by = doc.created_by;
            project_geo.created_date = doc.created_date;
            project_geo.modified_by = decoded.iss; // modified by
            project_geo.modified_date = new Date().getTime(); // modified date
            
            //update project geo
            Model.insertDocument(Model.Databases.PROJECT_GEO, project_geo, id, doc._rev).then(function (resProjGeo) {
                if (resProjGeo._id) {
                    res.status(201).location(domain.domain.url + '/v1/admin/projectgeo/' + doc._id).send();
                    
                    //only update project and utilization databases if the project geo name has been changed
                    //since project geo ID is not supplied in the DB, this code would assume that project geo in both projects and utilizations DB are updated regulary
                    if (resProjGeo.name != doc.name) {
                        var queryGeo = {selector: {$text: doc.name}};
                        Model.queryDocuments(Model.Databases.PROJECTS, queryGeo).then(function (docs) {
                            // if this particular project geo description is present in the projects database, update them as well
                            if (docs.docs.length > 0) {
                                var projectGeoDocs = [];
                                _.each(docs.docs, function (projGeo) {
                                    if (projGeo.geo.toLowerCase() == doc.name.toLowerCase()) {
                                        projGeo.geo = project_geo.name;
                                        projectGeoDocs.push(projGeo);
                                    }
                                });

                                Model.bulk(Model.Databases.PROJECTS, {"docs": projectGeoDocs}).then(function (result) {
                                    res.status(204).send();
                                    return;
                                }, function (err) {
                                    // if error
                                    Model.destroyDocument(Model.Databases.PROJECTS, resProjGeo._id, resProjGeo._rev).then(function (resDoc) {
                                        if (resDoc.ok) {
                                            delete doc._rev;
                                            Model.insertDocument(Model.Databases.PROJECTS, doc).then(function (reInsertedprojGeo) {
                                                if (reInsertedprojGeo._id) {
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
                    else {  // if this particular project_geo id is not present in the project_geo database, just send the response
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