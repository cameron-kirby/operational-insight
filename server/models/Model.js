/*
 Author : Harish Yayi
 Description : This file contains all the CRUD methods to access the CLOUDANT database
 Created On : July 21, 2015
 Last Edited : March 30, 2016
 Last Edited By : Harish Yayi
 */

'use strict';

// API imports.
const cloudant = require('cloudant');
const q = require('q');
const _ = require('underscore');
const cloudantCredentials = require('../../config/db-secret').bluemixCloudantAccount;
const logger = require('../helper/Logger');

// Database credentials, Object.freeze() is used to prevent the object from being modified
const DATABASE_DEFAULTS = Object.freeze({
    account: cloudantCredentials.accountName,
    password: cloudantCredentials.password,
});

// create the cloudant connection
const conn = cloudant(DATABASE_DEFAULTS);

// Exports Operational Insight API as a NodeJS module.
const Opin = module.exports;

// Databases present in the application,
// Object.freeze() is used to prevent the object from being modified
Opin.Databases = Object.freeze({
    USERS: 'users',
    PROJECTS: 'projects',
    UTILIZATIONS: 'utilizations',
    SKILLS: 'skills',
    CATEGORIES: 'categories',
    PROJECT_GEO: 'project_geo',
    ROLES: 'roles',
    EMPLOYEE_TYPE: 'employee_type',
    LOGIN_TOKEN: 'login_token',
    SCHEDULED_TASK: 'scheduled_task',
    PROJECT_STATUS: 'project_status',
    EMPLOYEE_STATUS: 'employee_status',
    PROJECT_PROCESS: 'project_process',
    JOB_ROLES: 'job_roles',
    NEWSFEED: 'newsfeed',
    MANAGERS: 'managers',
});


/**
 * After establishing a database connection it tries to insert a new document --
 * into database. This function returns a deferred promise object which will ---
 * trigger the corresponding callback function if:
 *
 * 1) the database connection was established successfully AND the document was-
 *    inserted successfully also, then the RESOLVE callback function will be ---
 *    called, or
 * 2) the database connection could not be established OR the new document could
 *    not be inserted, then the REJECT callback function will be called.
 *
 * WARNING! Please, be aware of Cloudant database will overwrite an existing ---
 * document if a document with the same id already exists.
 *
 * @param    data    {Object}    a new document as a JSON object
 * @returns    -        {Object}    a referred promise
 */
Opin.insertDocument = (dbname, document, id, rev) => {
    const deferred = q.defer();

    // Nano API takes the ´docName´ parameter as the document id. Any other
    // parameter is passed over as it is(?).
    const parameters = {
        docName: id,
    };

    // ´rev´ parameter must be set if updating is required.
    if (!_.isEmpty(rev)) {
        parameters.rev = rev;
    }

    conn.db.use(dbname).insert(document, parameters, (err, doc) => {
        if (err) {
        const error = {};
        error.errorString = 'Error in insertDocument method';
        error.errorJSON = err;
        logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
        deferred.reject(error);
    } else {
        // Set new attributes in request.
        const resultDocument = document;
        resultDocument._id = doc.id;
        resultDocument._rev = doc.rev;
        deferred.resolve(resultDocument);
    }
});
return deferred.promise;
};


/**
 * After establishing a database connection it tries to retrieve document by id i.e _id.
 * This function returns a deferred promise object which will ---
 * trigger the corresponding callback function if:
 *
 * 1) the database connection was established successfully AND the documents was-
 *    retrieved successfully also, then the RESOLVE callback function will be ---
 *    called, or
 * 2) the database connection could not be established OR the  documents could
 *    not be retrieved, then the REJECT callback function will be called.
 *
 * @param    dbname    {String}
 * @param    keys    {Array}
 * @return    promise    {Object}
 */
Opin.retrieveDocumentsById = (dbname, keys, single) => {
    const deferred = q.defer();
    conn.db.use(dbname).fetch({ keys }, (err, docs) => {
        if (err) {
        const error = {};
        error.errorString = 'Error in retrieveDocumentsByID method';
        error.errorJSON = err;
        logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
        deferred.reject(error);
    } else {
        const _docs = [/* empty */];
        // Remove unnecessary information from response.
        _.each(docs.rows, (row) => {
            _docs.push(row.doc);
    });
    if (single) {
        deferred.resolve(_docs[0]);
    } else {
        deferred.resolve(_docs);
    }
}
});
return deferred.promise;
};


/**
 * This function performs a search into the specified Cloudant database, -------
 * accordingly to the parameterized ´dbname´ value. It establishes a database --
 * connection and carries out the search to retrieve all matching document or --
 * documents that comply with the search query. This function returns a deferred
 * promise object which will trigger the corresponding callback function:
 *
 * 1) the database connection was established successfully AND zero or more ----
 *    documents that match the parameterized search query were found, then the -
 *    RESOLVE callback function will be called, or
 * 2) the database connection could not be established OR something went wrong -
 *    at the database server's side, then the REJECT callback function will be -
 *    called.
 *
 * Search query examples:
 * 1) default:*
 *    Find all documents.
 * 2) owner:"cgarcia1@us.ibm.com"
 *    Find documents whose owner index is equals to ´cgarcia1@us.ibm.com´.
 *
 * @param        dbname        {String}    the name of the database to be used
 * @param        query        {String}    the well-formed search query
 * @returns        promise        {Object}    a deferred promise
 */
Opin.searchDocuments = (dbname, query, index, settings) => {
    // Default settings.
    const defaults = {
        query: query || '*:*',
        include_docs: true,
    };

    // List of configurable properties.
    const properties = ['include_docs',
        'limit',
        'bookmark',
        'skip',
        'include_fields'];

    if (settings) {
        _.each(properties, (property) => {
            if (_.has(settings, property)) {
            defaults[property] = settings[property];
        }
    });
}

const deferred = q.defer();
conn.db.use(dbname)
  .search('documents', index, defaults, (err, docs) => {
    if (err) {
    const error = {};
    error.errorString = 'Error in searchDocuments method';
    error.errorJSON = err;
    logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
    deferred.reject(error);
} else {
    deferred.resolve(docs);
}
});
return deferred.promise;
};

/**
 * After establishing a database connection it tries to query documents by Cloudant query.
 * This function returns a deferred promise object which will ---
 * trigger the corresponding callback function if:
 *
 * 1) the database connection was established successfully AND the documents was-
 *    retrieved successfully also, then the RESOLVE callback function will be ---
 *    called, or
 * 2) the database connection could not be established OR the  documents could
 *    not be retrieved, then the REJECT callback function will be called.
 *
 * @param    dbname    {String}
 * @param    query    {Object}
 * @return    promise    {Object}
 */


Opin.queryDocuments = (dbname, query) => {
    const deferred = q.defer();
    conn.db.use(dbname)
      .find(query, (err, docs) => {
        if (err) {
        const error = {};
        error.errorString = 'Error in queryDocuments method';
        error.errorJSON = err;
        logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
        deferred.reject(error);
    } else {
        deferred.resolve(docs);
    }
});
return deferred.promise;
};


Opin.queryView = (dbname, viewname, parameters, flag) => {
    // Default query parameters.
    const defaults = {
        include_docs: true,
        stale: 'ok',
    };

    // include_docs cannot be used with view if group paramater is used
    if (flag) {
        delete defaults.include_docs;
    }
    // List of allowed configurable properties.
    const properties = ['include_docs',
        'key',
        'keys',
        'limit',
        'skip',
        'group',
        'reduce',
        'startkey',
        'endkey',
        'group_level'];
    if (parameters && _.isObject(parameters)) {
        _.each(properties, (property) => {
            if (_.has(parameters, property)) {
            defaults[property] = parameters[property];
        }
    });
}

// Create deferred object.
const deferred = q.defer();
conn.db.use(dbname)
  .view('documents', viewname, defaults, (err, data) => {
    if (err) {
    const error = {};
    error.errorString = 'Error in queryView method';
    error.errorJSON = err;
    logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
    deferred.reject(error);
} else {
    deferred.resolve(data);
}
});
// Return promise.
return deferred.promise;
};

/**
 * After creating a database connection it removes (destroy) the document with -
 * the id, and the revision specified in the arguments. This function returns a-
 * deferred promise object which will trigger the corresponding callback -------
 * function if:
 *
 * 1) the database connection was established AND the document with the --------
 *    specified id, and revision was destroyed successfully, then the RESOLVE --
 *    callback function will be called, or
 * 2) the database connection could not be established OR the document with the-
 *    specified id, and revision could not be found, then the REJECT callback --
 *    function will be called.
 *
 * @param    id        {String}    the document unique id
 * @param    rev        {String}    the document revision
 * @returns    -        {Object}    a referred promise
 */
Opin.destroyDocument = (dbname, id, rev) => {
    const deferred = q.defer();

    conn.db.use(dbname).destroy(id, rev, (err, doc) => {
        if (err) {
        const error = {};
        error.errorString = 'Error in destroyDocument method';
        error.errorJSON = err;
        logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
        deferred.reject(error);
    } else {
        deferred.resolve(doc);
    }
});
return deferred.promise;
};

/**
 * After creating a database connection it can bulk update or insert the
 * documents to database, if only _ids of the documents are provided then the bulk method
 * inserts the documents to database, if both _ids and _revs of the documents are provided
 * then the bulk method updates the documents in the database.
 *
 * 1) the database connection was established AND the document with the --------
 *    specified id, and revision was destroyed successfully, then the RESOLVE --
 *    callback function will be called, or
 * 2) the database connection could not be established OR could not bulk insert or update
 *    the docs, then the REJECT callback --
 *    function will be called.
 *
 * @param    docs        {Object}    Ex: {docs:[documentsToBeInserted]}
 */
Opin.bulk = (dbname, docs, destroy) => {
    const deferred = q.defer();
    // If the ´destroy´ parameter is set to ´true´, a ´_deleted´ property --
    // should be added to each document, thus CloudantDB server knows it has
    // to delete the documents.
    const bulkDocs = docs;
    if (destroy) {
        for (let iDoc = 0; iDoc < bulkDocs.docs.length; ++iDoc) {
            bulkDocs.docs[iDoc]._deleted = true;
        }
    }
    conn.db.use(dbname).bulk(bulkDocs, (err, response) => {
        if (err) {
        const error = {};
        error.errorString = 'Error in bulk method';
        error.errorJSON = err;
        logger.log('error', error.errorString.concat('---', JSON.stringify(err)));
        deferred.reject(error);
    } else {
        deferred.resolve(response);
    }
});
return deferred.promise;
};
