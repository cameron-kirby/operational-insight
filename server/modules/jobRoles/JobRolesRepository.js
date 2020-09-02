'use strict';

const q = require('q');

const Model = require('../../models/Model');


/**
 * Respository for interacting with documents in the JobRoles database.
 */
class JobRolesRepository {
  /**
   * Creates a new job roles document, or updates an existing document.
   * If a _rev is contained within the job roles document, and that _rev
   * matches the latest revision for that document, then the document will be updated.
   *
   * @param {JobRole} jobRoleDocument
   *    The document to be saved to the database.
   *
   * @returns {Promise}
   *    The promise to save the job role document.
   */
  createOrUpdate(jobRoleDocument) {
    const deferred = q.defer();

    Model.insertDocument(Model.Databases.JOB_ROLES,
      jobRoleDocument,
      jobRoleDocument._id,
      jobRoleDocument._rev)
      .then((doc) => {
        if (doc._id) {
          deferred.resolve(doc._id);
        } else {
          const resObj = {};
          resObj.status_code = 500;
          resObj.message = 'Could not save the Job Role.';
          deferred.reject(resObj);
        }
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not save the Job Role. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Deletes a JobRole document, using its id, and revision as indices.
   *
   * @param {String} document
   *    The JobRole document that will be destroyed.
   *
   * @returns {Promise}
   *    The promise to delete the document.
   */
  delete(document) {
    const deferred = q.defer();

    Model.destroyDocument(Model.Databases.JOB_ROLES, document._id, document._rev)
      .then((doc) => {
        deferred.resolve(doc.id);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not delete the JobRole. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all of the Job Roles. This method accepts both a limit, and an offset parameter used to
   * reduce the number of records returned in a single call.
   *
   * @params {Number} limit
   *    The number of records that will be returned.
   * @params {Number} offset
   *    The position of the first record that will be returned.
   *
   * @returns {Promise}
   *    The promise to return the job roles.
   */
  findAll(limit,
    offset) {
    const deferred = q.defer();

    const query = {
      selector: {
        name: {
          $regex: '^.*',
        },
      },
      limit,
      skip: offset,
    };

    Model.queryDocuments(Model.Databases.JOB_ROLES, query)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not retrive the JobRoles. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds a JobRole by its id.
   *
   * @param {Number} id
   *    The id of the JobRole.
   *
   * @returns {Promise}
   *    The promise to return the JobRole.
   */
  findById(id) {
    const deferred = q.defer();

    Model.retrieveDocumentsById(Model.Databases.JOB_ROLES, [id], true)
      .then((jobRoleDoc) => {
        if (jobRoleDoc === undefined) {
          const resObj = {};
          resObj.status_code = 404;
          resObj.message = `Could not find the JobRole with id [${id}].`;
          deferred.reject(resObj);
        }

        deferred.resolve(jobRoleDoc);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not find the JobRole with id [${id}]. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = JobRolesRepository;
