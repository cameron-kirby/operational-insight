'use strict';

/**
 * Test helper for dealing with the database.
 */

const _ = require('underscore');
const assert = require('assert');
const q = require('q');

const Model = require('../server/models/Model');

/**
 * Creates or updates a database with the given document.
 *
 * @param {String} database
 *    The name of the database.
 * @param {String} queryKey
 *    The key searched used to identify the document.
 * @param {String} queryValue
 *    The value used to identify the document.
 * @param {Document} testDocument
 *    The document used in the test.
 *
 * @returns {Promise}
 *    The promise to update and return the Document.
 */
module.exports.createOrUpdate = (database, queryKey, queryValue, testDocument) => {
  const deferred = q.defer();

  const query = {
    selector: {
    },
  };
  query.selector[queryKey] = queryValue;

  // Determine if the test document already exists.
  // If it does, update it. Otherwise, create a new one.
  Model.queryDocuments(database, query)
    .then((testDocs) => {
      let id;
      let rev;
      if (testDocs.docs.length === 0) {
        rev = undefined;

        // Case where the _id is specified in the document.
        id = (testDocument._id) ? testDocument._id : undefined;
      } else {
        id = testDocs.docs[0]._id;
        rev = testDocs.docs[0]._rev;
      }

      const newDoc = testDocument;
      newDoc._id = id;
      newDoc._rev = rev;

      Model.insertDocument(database, newDoc)
        .then((newDocument) => {
          deferred.resolve(newDocument);
        })
        .catch((error) => {
          deferred.reject(error);
        });
    })
    .catch(() => {
      // The document doesn't exist.
      Model.insertDocument(database, testDocument)
        .then((newDocument) => {
          deferred.resolve(newDocument);
        })
        .catch((error) => {
          deferred.reject(error);
        });
    });

  return deferred.promise;
};


/**
 * Performs a comparison between the two documents.
 *
 * @param {Document} firstDocument
 *    The first document.
 * @param {Document} secondDocument
 *    The second document.
 */
module.exports.compareDocuments = (firstDocument, secondDocument) => {
  // Comparing all of the properties in the first document.
  for (const prop in firstDocument) {
    if (prop !== '_id' && prop !== '_rev' &&
      firstDocument.hasOwnProperty(prop)) {
      assert(firstDocument[prop] === secondDocument[prop]);
    }
  }


  // Comparing all of the properties in the second document.
  for (const prop in secondDocument) {
    if (prop !== '_id' && prop !== '_rev' &&
      secondDocument.hasOwnProperty(prop)) {
      assert(firstDocument[prop] === secondDocument[prop]);
    }
  }
};


/**
 * Converts an array of data to the format that would come from a query call.
 *
 * @param {Array} array
 *    An array of data that will be converted.
 *
 * @returns {Object}
 *    The array in the same format as a view call. An Example is below:
 *
 * {
 *   docs: [
 *     {DatabaseDocument}
 *   ]
 * }
 */
module.exports.convertArrayToQueryData = (array) => {
  const result = {
    docs: [],
  };

  _.each(array, (document) => {
    result.docs.push(document);
  });

  return result;
};


/**
 * Converts an array of data to the format that would come from a view call.
 *
 * @param {Array} array
 *    An array of data that will be converted.
 *
 * @returns {Object}
 *    The array in the same format as a view call. An Example is below:
 *
 * {
 *   rows: [
 *     data: {
 *       doc : {
 *         {DatabaseDocument}
 *       }
 *     }
 *   ]
 * }
 */
module.exports.convertArrayToViewData = (array) => {
  const result = {
    rows: [],
  };

  _.each(array, (document) => {
    const documentContainer = {
      doc: document,
    };

    result.rows.push(documentContainer);
  });

  return result;
};


/**
 * deletes the document found by the given query.
 *
 * @param {String} databaseName
 *    The name of the database.
 * @param {String} queryKey
 *    The key searched used to identify the document.
 * @param {String} queryValue
 *    The value used to identify the document.
 * @param {Document} testDocument
 *    The document used in the test.
 *
 * @returns {Promise}
 *    The promise to update and return the Document.
 */
module.exports.delete = (databaseName, queryKey, queryValue) => {
  const deferred = q.defer();

  const query = {
    selector: {
    },
  };
  query.selector[queryKey] = queryValue;


  // Find the document, so we can obtain its _id, and _rev.
  Model.queryDocuments(databaseName, query)
    .then((documents) => {
      if (!documents.docs
        || documents.docs.length === 0) {
        deferred.reject(`No documents found that match query [${queryKey} : ${queryValue}]`);
      } else if (documents.docs.length > 1) {
        deferred.reject('Too many documents returned. Check your test data!');
      }


      Model.destroyDocument(databaseName, documents.docs[0]._id, documents.docs[0]._rev)
        .then(() => {
          deferred.resolve();
        })
        .catch((error) => {
          deferred.reject(error);
        });
    })
    .catch((error) => {
      deferred.reject(error);
    });


  return deferred.promise;
};


module.exports.findAll = (databaseName) => {
  const deferred = q.defer();

  const query = {
    selector: { name: { $regex: '^.*' } },
  };
  Model.queryDocuments(databaseName, query)
    .then((docs) => {
      deferred.resolve(docs);
    })
    .catch((error) => {
      const resObj = {};
      resObj.status_code = 404;
      resObj.message = `Categories not found. Error was ${error}`;
      deferred.reject(resObj);
    });

  return deferred.promise;
};


module.exports.findOne = (databaseName, queryKey, queryValue) => {
  const deferred = q.defer();

  const query = {
    selector: {
    },
  };
  query.selector[queryKey] = queryValue;


  // Find the document, so we can obtain its _id, and _rev.
  Model.queryDocuments(databaseName, query)
    .then((documents) => {
      if (documents.docs.length === 0) {
        deferred.reject(`No documents found that match query [${queryKey} : ${queryValue}]`);
      } else if (documents.docs.length > 1) {
        deferred.reject('Too many documents returned. Check your test data!');
      }

      deferred.resolve(documents.docs[0]);
    })
    .catch((error) => {
      deferred.reject(error);
    });

  return deferred.promise;
};
