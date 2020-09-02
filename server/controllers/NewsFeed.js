/*
 Author : Harish Yayi
 Description : This file contains all the functionalities related to Newsfeed module like create,find,update and delete.
 Created On : August 14, 2015
 Last Edited : August 14, 2015
 Last Edited By : Harish Yayi
 */


var q = require('q');
var async = require('async');
var _ = require('underscore');
var Model = require('../models/Model');
var jwt = require('jwt-simple');
//var domain = require('../../config/development');
var config = require('config');
var rest_url = config.get('domain.url')

/*
 Author : Harish Yayi
 Description : This method is for creating a new newsfeed in the database.
 Created On : August 14, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.add = function (req, res) {

    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    // series of validations
    if (_.isEmpty(req.body.content)) {
        res.status(400).json({'error_code': 400, 'message': 'Content is mandatory'});
        return;
    }
    if (_.isEmpty(req.body.start_date)) {
        res.status(400).json({'error_code': 400, 'message': 'Start date is mandatory'});
        return;
    }
    if (_.isEmpty(req.body.end_date)) {
        res.status(400).json({'error_code': 400, 'message': 'End date is mandatory'});
        return;
    }
    if (!_.isEmpty(req.body.start_date)) {
        if (new Date(parseInt(req.body.start_date)).getTime() < 0) {
            res.status(400).json({'error_code': 400, 'message': 'Start date is invalid'});
            return;
        }
    }
    if (!_.isEmpty(req.body.end_date)) {
        if (new Date(parseInt(req.body.end_date)).getTime() < 0) {
            res.status(400).json({'error_code': 400, 'message': 'End date is invalid'});
            return;
        }
    }
    var newsFeed = {
        content: req.body.content,
        start_date: parseInt(req.body.start_date),
        end_date: parseInt(req.body.end_date),
        created_by: decoded.iss,
        created_date: new Date().getTime()
    }
    //insert the newsfeed document into the database.
    Model.insertDocument(Model.Databases.NEWSFEED, newsFeed).then(function (doc) {
        if (doc._id) {
            res.status(201).location(rest_url + '/v1/newsfeed/' + doc._id).send(); //send the json response with the url of the resource in location header
            return;
        }
        else {
            res.status(500).json({'error_code': 500, 'message': "Could not save the NewsFeed"});
            return;
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': "Could not save the NewsFeed"});
        return;
    });
}

/*
 Author : Harish Yayi
 Description : This method is for updating a new newsfeed in the database.First get the newsfeed from the database
 based on the id from the request, then update the document with the new newsfeed document provided in the request body.
 Created On : August 14, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.update = function (req, res) {
    var id = req.params.newsfeedId; //  newsfeed ID
    var token = req.headers['x-access-token'];
    var decoded = jwt.decode(token, require('../../config/secret.js')()); // get the user who invoked the api
    // series of validations
    if (!_.isEmpty(req.body.start_date)) {
        if (new Date(parseInt(req.body.start_date)).getTime() < 0) {
            res.status(400).json({'error_code': 400, 'message': 'Start date is invalid'});
            return;
        }
    }
    if (!_.isEmpty(req.body.end_date)) {
        if (new Date(parseInt(req.body.end_date)).getTime() < 0) {
            res.status(400).json({'error_code': 400, 'message': 'End date is invalid'});
            return;
        }
    }
    // retrieve the newsfeed document by id in the url
    Model.retrieveDocumentsById(Model.Databases.NEWSFEED, [id], true).then(function (doc) {
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Newsfeed not found'});
            return;
        }
        var newsFeed = {
            content: (req.body.content) ? req.body.content : doc.content,
            start_date: (req.body.start_date) ? req.body.start_date : doc.start_date,
            end_date: (req.body.end_date) ? req.body.end_date : doc.end_date,
            created_by: (req.body.created_by) ? req.body.created_by : doc.created_by,
            created_date: (req.body.created_date) ? req.body.created_date : doc.created_date,
            modified_by: decoded.iss,
            modified_date: new Date().getTime()
        }
        //update the document
        Model.insertDocument(Model.Databases.NEWSFEED, newsFeed, id, doc._rev).then(function (resDoc) {
            if (resDoc._id) {
                res.status(204).location(rest_url + '/v1/newsfeed/' + resDoc._id).send(); //send the json response with the url of the resource in location header
                return;
            }
            else {
                res.status(500).json({'error_code': 500, 'message': "Could not save the NewsFeed"});
                return;
            }
        }, function (err) {
            res.status(500).json({'error_code': 500, 'message': "Could not save the NewsFeed"});
            return;
        });
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': "Could not save the NewsFeed"});
        return;
    });
}

/*
 Author : Harish Yayi
 Description : This method is for retrieving a particular newsfeed from the database based on the id from the request.
 Created On : August 14, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.getNewsFeed = function (req, res) {
    var id = req.params.newsfeedId; //  newsfeed ID
    Model.retrieveDocumentsById(Model.Databases.NEWSFEED, [id], true).then(function (doc) {
        // if no document found
        if (doc == undefined) {
            res.status(404).json({'error_code': 404, 'message': 'Newsfeed not found'});
            return;
        }
        else {
            res.status(200).json({
                kind: "Resource#NewsFeed",
                item: doc
            });
        }
    }, function (err) {
        res.status(500).json({'error_code': 500, 'message': 'Could not retrieve newsfeed'});
        return;
    });


}


/*
 Author : Harish Yayi
 Description : This method is for retrieving a list of newsfeeds from the database taking limit and offset provided in the url into consideration.
 If an optional filter "date" is provided,then it retrieves all the newsfeeds where the date falls in between start_date and end-date of the newsfeed.
 Created On : August 14, 2015
 Last Edited : August 14,2015
 Last Edited By : Harish Yayi
 */
module.exports.getNewsFeeds = function (req, res) {
    var finalDoc = {}; // creating a new json document to send it in the response by custom building it.
    finalDoc.kind = "Resource#NewsFeedList";
    finalDoc.pageInfo = {};
    finalDoc.items = [];
    var limit = req.query.limit;
    var offset = req.query.offset;
    var date = req.query.date;
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
    if (date) {
        if (new Date(parseInt(date)).getTime() < 0) {
            res.status(400).json({'error_code': 400, 'message': 'date is invalid'});
            return;
        }
    }
    var query = {};
    if (date) // if date filter is provided in the url
    {
        query = {
            selector: {
                content: {$regex: "^.*"},
                start_date: {$lte: parseInt(date)},
                end_date: {$gte: parseInt(date)}
            }, limit: (limit == undefined || isNaN(limit) || limit == '') ? undefined : parseInt(limit),
            skip: parseInt(offset)
        };
        //query for newsfeeds
        Model.queryDocuments(Model.Databases.NEWSFEED, query).then(function (docs) {
            var newsfeeds = docs.docs;
            if (newsfeeds.length == 0) // if not projects found
            {
                finalDoc.pageInfo.totalResults = 0;
                finalDoc.pageInfo.resultsPerPage = 0;
                res.status(200).json(finalDoc);
                return;
            }
            else if (newsfeeds.length > 0) {
                // if date filter is provided, pageInfo is not required
                delete finalDoc.pageInfo;
                finalDoc.items = newsfeeds;
                res.status(200).json(finalDoc);
                return;
            }
        }, function (err) {
            res.status(500).json({'error_code': 500, 'message': 'Could not retrieve newsfeeds'});
            return;
        });
    }
    else // if date filter is not provided in the url
    {
        // query view for news feeds
        Model.queryView(Model.Databases.NEWSFEED, 'newsfeeds', {
            limit: (limit == undefined || isNaN(limit) || limit == '') ? undefined : parseInt(limit),
            skip: parseInt(offset)
        }).then(function (docs) {
            if (docs.total_rows == 0) {
                finalDoc.pageInfo.totalResults = 0;
                finalDoc.pageInfo.resultsPerPage = 0;
                finalDoc.items = [];
                res.status(200).json(finalDoc);
                return;
            }
            else {
                var items = [];
                finalDoc.pageInfo.totalResults = docs.total_rows;
                limit: (limit == undefined || isNaN(limit) || limit == '') ? finalDoc.pageInfo.resultsPerPage = docs.total_rows : finalDoc.pageInfo.resultsPerPage = parseInt(limit);
                for (var i = 0; i < docs.rows.length; i++) {
                    items.push(docs.rows[i].value);
                }
                finalDoc.items = items;
                res.status(200).json(finalDoc);
                return;
            }
        }, function (err) {
            console.log(err)
            res.status(500).json({'error_code': 500, 'message': 'Could not retrieve newsfeeds'});
            return;
        });
    }
}
