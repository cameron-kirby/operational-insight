'use strict';


const q = require('q');

const Model = require('../../models/Model');


/**
 * Repository for interacting with documents in the Projects database.
 */
class ProjectsRepository {
  /**
   * Finds all of the skills that have the job role with the specified name.
   *
   * @param {String} jobRoleName
   *    The name of the job role.
   *
   * @returns {Promise}
   *    The promise to return the projects that have a job role with the given name.
   */
  findByJobRoleName(jobRoleName) {
    const deferred = q.defer();

    const query = {
      selector: {
        _id: {
          $gt: 0,
        },
        team: {
          $elemMatch: {
            job_role: jobRoleName,
          },
        },
      },
    };

    Model.queryDocuments(Model.Databases.PROJECTS, query)
      .then((docs) => {
        deferred.resolve(docs);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not find projects with job rolle [${jobRoleName}].`
          + ` Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Updates a group of project documents at one time.
   *
   * @param {Project[]} projectDocuments
   *    An array of project documents.
   *
   * @returns {Promise}
   *    The promise to update all of the project documents.
   */
  updateList(projectDocuments) {
    const deferred = q.defer();

    Model.bulk(Model.Databases.PROJECTS, { docs: projectDocuments })
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Bulk Projects update failed. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = ProjectsRepository;
