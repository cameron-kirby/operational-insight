'use strict';

const _ = require('underscore');
const q = require('q');

const Model = require('../../models/Model');


/**
 * Repository for the Utilization module. This repository manipulates
 * the Utilization documents in the Utilizations database.
 */
class UtilizationRepository {
  /**
   * Creates a new Utilization document, or updates an existing document.
   * If a _rev is contained within the Utilization document, and that _rev
   * matches the latest revision for that document, then the document will be updated.
   *
   * @param {Utilization} utilizationDocument
   *    The document to be saved to the database.
   *
   * @returns {Promise}
   *    The promise to save the Utilization document.
   */
  createOrUpdate(utilizationDocument) {
    const deferred = q.defer();

    Model.insertDocument(Model.Databases.UTILIZATIONS,
     utilizationDocument,
     utilizationDocument._id,
     utilizationDocument._rev)
      .then((doc) => {
        if (doc._id) {
          deferred.resolve(doc._id);
        } else {
          const resObj = {};
          resObj.status_code = 500;
          resObj.message = 'Could not save the Utilization';
          deferred.reject(resObj);
        }
      })
      .catch((err) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not save the Utilization. Error was ${err.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all of the utilizations that have a job role with the given name.
   *
   * @params {String} jobRoleName
   *    The name of the JobRole.
   *
   * @returns {Promise}
   *    The promise to return the list of utilizations that have a job role with the given name.
   */
  findByJobRoleName(jobRoleName) {
    const deferred = q.defer();
    const query = {
      selector: {
        _id: {
          $gt: 0,
        },
        projects: {
          $elemMatch: {
            utilization: {
              $elemMatch: {
                job_role: jobRoleName,
              },
            },
          },
        },
      },
    };

    Model.queryDocuments(Model.Databases.UTILIZATIONS, query)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not save the Utilization. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
  /**
   * Finds all of the utilizations for the given manager's direct reports.
   *
   * @param {JSON} frontBookmark
   *   The front bookmark of the query.
   * @param {Number} limit
   *   The maximum number of utilizations that will be returned.
   * @param {Number} offset
   *   The offset of the query.
   * @param {String} managerId
   *   The id of the manager.
   *
   * @returns {Promise}
   *   The promise to return the list of utilizations for the direct reports of the given
   *   manager and date range.
   */
  findByManager(frontBookmark,
    limit,
    offset,
    managerId) {
    const deferred = q.defer();

    const reportsTo = (!_.isEmpty(managerId) && managerId !== 'all') ? {
      $eq: managerId,
    } : undefined;

    const queryLimit = (limit === undefined || isNaN(limit) || limit === '')
      ? undefined
      : parseInt(limit, 10);

    const query = {
      selector: {
        _id: {
          $regex: '^.*',
        },
        reports_to: reportsTo,
      },
      limit: queryLimit,
      skip: parseInt(offset, 10),
      fields: ['_id', 'user_id', 'fname', 'lname', 'job_title', 'projects', 'reports_to'],
      sort: [{
        'fname': 'asc',
      }],
      bookmark: frontBookmark,
    };

    Model.queryDocuments(Model.Databases.UTILIZATIONS, query)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Utilizations for users under manager ${managerId} were
          not found. Error was ${error}`;
        deferred.reject(resObj);
      });


    return deferred.promise;
  }


  /**
   * Finds all of the utilization's that have not been updated within the specified timestamp.
   *
   * @params {Number} endDate
   *    The timestamp for the end date of the query.
   * @returns {Promise}
   *    The promise to return the utilizations that are out of date.
   */
  findByUpdatedDateOutsideDateRange(endDate) {
    const deferred = q.defer();

    // Searching for all updated_date's which are > than endDate.
    const params = {
      startkey: new Date(1900, 0, 1).getTime(),
      endkey: endDate,
    };

    Model.queryView(Model.Databases.UTILIZATIONS, 'validationCheck', params)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Utilizations query for updated_date > ${endDate} failed.
          Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all of the utilizations for the user with the given id.
   *
   * @param {String} userId
   *    The id of the user.
   *
   * @returns {Promise}
   *    The promise to return all of the utilizations for the user.
   */
  findByUserId(userId) {
    const deferred = q.defer();
    const query = {
      selector: {
        user_id: userId,
      },
    };

    Model.queryDocuments(Model.Databases.UTILIZATIONS, query)
      .then((documents) => {
        if (!documents || documents.docs.length === 0) {
          const resObj = {};
          resObj.status_code = 404;
          resObj.message = `Utilizations for user with id ${userId} are
            not found.`;
          deferred.reject(resObj);
        } else {
          deferred.resolve(documents);
        }
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Utilizations query for user with id ${userId} failed.
          Error was ${error}`;
        deferred.reject(resObj);
      });


    return deferred.promise;
  }

  /**
   * Updates a group of utilization documents at one time.
   *
   * @param {Utilization[]} utilizationDocuments
   *    An array of utilization documents.
   *
   * @returns {Promise}
   *    The promise to update all of the utilization documents.
   */
  updateList(utilizationDocuments) {
    const deferred = q.defer();

    Model.bulk(Model.Databases.UTILIZATIONS, { docs: utilizationDocuments })
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Bulk Utilization update failed. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = UtilizationRepository;
