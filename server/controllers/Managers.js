/*
 * This is a controller to handle REST services GET, POST, PUT, and DELETE
 *
 * For custom test of REST services see https://www.getpostman.com/collections/7f623b88b59670abf788
 *
 * @author: 	Caesar cavales << cbcavale@us.ibm.com >>
 * @version: 	1.0
 * @modified: 	January 07th, 2016
 *
 */
var Model = require('../models/Model');
var q = require('q');

/*
 Author : Caesar Cavales
 Description : This method is for retrieving all managers from the managers table in cloudant
 Created On : January 7, 2016
 Last Edited : January 7, 2016
 Last Edited By : Caesar Cavales
 */
module.exports.getManagers = function (req, res) {
    var limit = req.query.limit;
    var offset = req.query.offset;
    var managersDoc = {};
    managersDoc.kind = "Resource#ManagersList";
    managersDoc.items = [];
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
        selector: {_id: {$regex: "^.*"}},
        limit: (limit==undefined || isNaN(limit) || limit=='') ? undefined : parseInt(limit),
        skip: parseInt(offset)
    };

    Model.queryDocuments(Model.Databases.MANAGERS, query).then(function (documents) {
        managersDoc.items = documents.docs;
        res.status(200).json(managersDoc);
        return;
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not retrieve MANAGERS'});
        return;
    });
}

/*
 Author : Caesar Cavales
 Description : This method is for retrieving ONE managers from the managers table in cloudant
 Created On : January 01, 2016
 Last Edited : January 01, 2016
 Last Edited By : Caesar Cavales
 */
module.exports.getOneManager = function (req, res) {
    var id = req.params.managerId;

    Model.retrieveDocumentsById(Model.Databases.MANAGERS, [id], true).then(function (doc) {
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Manager not found'});
            return;
        }
        else {
            res.status(200).json({
                "kind": "Resource#ManagerDetails",
                "item": doc
            });
            return;
        }
    });
}