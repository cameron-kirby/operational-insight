'use strict';


const q = require('q');

const Model = require('../../models/Model');
const errorHelper = require('../../helper/ErrorHelper');


/**
 * Database Repository for tasks to be executed by the Scheduler.
 */
class ScheduledTaskRepository {
  /**
   * Finds all of the Scheduled Tasks in the database.
   *
   * @returns {ScheduleTask[]}
   *    The array of scheduled tasks.
   */
  findEnabled() {
    const deferred = q.defer();

    Model.queryView(Model.Databases.SCHEDULED_TASK, 'enabled')
      .then((scheduleTaskDocs) =>
        deferred.resolve(scheduleTaskDocs.rows)
      )
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('ScheduledTaskRepository::findById', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Finds a scheduled task by its id.
   *
   * @param {String} id
   *    The id of the task.
   * @returns {q.defer}
   *    The promise to return the scheduled task.
   */
  findById(id) {
    const deferred = q.defer();

    Model.retrieveDocumentsById(Model.Databases.SCHEDULED_TASK, [id], true)
      .then((document) =>
        deferred.resolve(document)
      )
      .catch((error) => {
        const errorObject =
          errorHelper.createAndLogError('ScheduledTaskRepository::findById', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Updates a scheduled task.
   *
   * @returns {q.defer}
   *    The promise to return the ScheduledTask.
   */
  update(document) {
    const deferred = q.defer();

    Model.insertDocument(Model.Databases.SCHEDULED_TASK, document, document._id)
      .then((doc) => {
        deferred.resolve(doc);
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('ScheduledTaskRepository::createOrUpdate',
          error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }
}

module.exports = ScheduledTaskRepository;
