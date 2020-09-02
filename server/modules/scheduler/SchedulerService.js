'use strict';

const moment = require('moment');
const q = require('q');
const schedule = require('node-schedule');

const errorHelper = require('../../helper/ErrorHelper');
const ScheduledTaskRepository = require('./ScheduledTaskRepository');
const scheduledTaskRepository = new ScheduledTaskRepository();

/**
 * Service that manages scheduled tasks. This module is responsible for
 * the creation, management and execution of scheduled tasks. Node-Scheduler
 * is used as the scheduler engine.
 *
 * The Scheduler follows the following rules:
 * 1. Disabled tasks are not executed unless explictly started with StartTask(taskname).
 * 2. Disabled tasks that are started ignore the 'lastExecuted' field for the ScheduledTask.
 * 3. Enabled tasks when started will honor the lastExecuted field for the ScheduledTask,
 *    and will only queue up the remaining duration for that task.
 * 4. Enabled tasks will execute immediately,
 *    if their last execution is greater than their frequency.
 *
 * If the Scheduler detects an error when executing a task,
 * the error is logged and the task is rescheduled.
 *
 * Example 1:
 * An email is to be sent out once an hour. The server starts but the task is disabled.
 * The task is then started with startTask at 1:22.
 * The next execution will be at 2:22, then 3:22, and so on.
 *
 * Example 2:
 * An email is to be sent out once an hour. The server starts but the task is disabled.
 * The task was last executed at 3:25. The task is started
 * at 6:27 that same day. The task queues up for execution at 7:27, but is not immediately executed,
 * since the task was already disabled.
 *
 * Example 3:
 * An email is to be sent out once an hour. The task is enabled, when the server starts.
 * The task was last executed at 7:21, and the current time
 * is 8:00. The task is queued up to launch at 8:21, twenty one minutes from now.
 *
 * Example 4:
 * An email is to be sent out once an hour. The task is enabled, when the server starts.
 * The task was last executed at 7:21, and the current time
 * is 8:25. The task is immediately executed, since it was last executed over an hour ago.
 */
class SchedulerService {
  /**
   * Constructs a new SchedulerService, using the supplied task factory.
   *
   * @param {Factory} taskFactory
   *    The factory used to build tasks.
   */
  constructor(taskFactory) {
    this._scheduledTasks = {};
    this._taskFactory = taskFactory;
  }


  /**
   * Creates the specified task using the supplied parameters.
   *
   * @param {String} taskName
   *    The name of the task to be created.
   * @param {Object} parameters
   *    The parameters used by the task's constructors.
   *
   * @returns {Function}
   *    The newly constructed task.
   */
  _createTask(taskName, parameters) {
    try {
      return this._taskFactory.create(taskName, parameters);
    } catch (error) {
      const errorObject = {
        message: `Task [${taskName}] does not exist.`,
      };
      throw errorObject;
    }
  }

  /**
   * Finds a task by its id.
   *
   * @param {String} id
   *    The id of the task.
   * @returns {q.defer}
   *    The promise to return the scheduled task.
   */
  findById(id) {
    const deferred = q.defer();

    scheduledTaskRepository.findById(id)
      .then((document) => {
        deferred.resolve(document);
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('SchedulerService::stopTask',
          error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Starts all of the enabled tasks.
   *
   * @returns {q.defer}
   *    The promise to start all of the tasks.
   */
  start() {
    const deferred = q.defer();

    scheduledTaskRepository.findEnabled()
      .then((enabledTasks) => {
        for (let iTask = 0; iTask < enabledTasks.length; ++iTask) {
          this.startTask(enabledTasks[iTask].id);
        }
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('SchedulerService::start', error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Stops all of the tasks that are currently running.
   */
  stopAllTasks() {
    for (let iTask = 0; iTask < this._scheduledTasks.length; ++iTask) {
      this._scheduledTasks[iTask].cancel();
    }

    this._scheduledTasks = [];
  }


  /**
   * Restarts a given task. This method reads the task's document
   * from the database in order to pick up on updated parameters. Then
   * startTask is called.
   */
  restartTask(taskId) {
    scheduledTaskRepository.findById(taskId)
      .then((taskDocument) => {
        this._launchTask(taskDocument);
      })
      .catch((error) =>
        errorHelper.createAndLogError('SchedulerService::restartTask', error)
      );
  }

  /**
   * Gets the scheduled time for the task.
   *
   * @param {ScheduledTask} taskDocument
   *    True if the task was already enabled.
   *
   * @returns {Date}
   *    The Date the task is to execute.
   */
  _getScheduledTime(taskDocument) {
    let scheduledTime = undefined;
    if (taskDocument.enable) {
      if (taskDocument.lastExecuted) {
        scheduledTime = moment(new Date(taskDocument.lastExecuted));
        scheduledTime.add(taskDocument.frequency.years, 'years');
        scheduledTime.add(taskDocument.frequency.months, 'months');
        scheduledTime.add(taskDocument.frequency.weeks, 'weeks');
        scheduledTime.add(taskDocument.frequency.days, 'days');
        scheduledTime.add(taskDocument.frequency.hours, 'hours');
        scheduledTime.add(taskDocument.frequency.minutes, 'minutes');
        scheduledTime.add(taskDocument.frequency.seconds, 'seconds');
      } else {
        // The task was never executed, start it immediately.
        scheduledTime = moment();
        scheduledTime.subtract(taskDocument.frequency.years, 'years');
        scheduledTime.subtract(taskDocument.frequency.months, 'months');
        scheduledTime.subtract(taskDocument.frequency.weeks, 'weeks');
        scheduledTime.subtract(taskDocument.frequency.days, 'days');
        scheduledTime.subtract(taskDocument.frequency.hours, 'hours');
        scheduledTime.subtract(taskDocument.frequency.minutes, 'minutes');
        scheduledTime.subtract(taskDocument.frequency.seconds, 'seconds');        
      }
    } else {
      scheduledTime = moment();
      scheduledTime.add(taskDocument.frequency.years, 'years');
      scheduledTime.add(taskDocument.frequency.months, 'months');
      scheduledTime.add(taskDocument.frequency.weeks, 'weeks');
      scheduledTime.add(taskDocument.frequency.days, 'days');
      scheduledTime.add(taskDocument.frequency.hours, 'hours');
      scheduledTime.add(taskDocument.frequency.minutes, 'minutes');
      scheduledTime.add(taskDocument.frequency.seconds, 'seconds');
    }

    return scheduledTime.toDate();
  }

  /**
   * Updates the lastExecuted time for the specified ScheduledTask.
   *
   * @param {String} taskId
   *    The id of the task, which will update its last executed time.
   */
  _updateLastExecutedTime(taskId) {
    const deferred = q.defer();

    scheduledTaskRepository.findById(taskId)
      .then((document) => {
        const updatedDoc = document;
        updatedDoc.lastExecuted = new Date().toString();
        scheduledTaskRepository.update(updatedDoc)
          .then((doc) => {
            deferred.resolve(doc);
          })
          .catch((error) => {
            const errorObject =
              errorHelper.createAndLogError('SchedulerService::updateLastExecutedTime',
                error);
            errorObject.documentId = taskId;
            deferred.reject(errorObject);
          });
      })
      .catch((error) => {
        const errorObject =
         errorHelper.createAndLogError('SchedulerService::updateLastExecutedTime',
          error);
        errorObject.documentId = taskId;
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Executes the specified task.
   *
   * @param {ScheduledTask} scheduledTaskRepository
   *    The task to be executed.
   * @param {ScheduledTask} taskDocument
   *    The document of the task being launched.
   */
  _executeTask(scheduledTask, taskDocument) {
    scheduledTask.start()
      .then(this._updateLastExecutedTime.bind(this))
      .then((document) => {
        // Only restart the task if it wasn't canceled.
        if (this._scheduledTasks[taskDocument._id]) {
          this.restartTask(document._id);
        }
      })
      .catch((error) => {
        // Only restart the task if it wasn't canceled.
        if (this.scheduledTasks[taskDocument._id]) {
          this.restartTask(error.documentId);
        }
      });
  }

  /**
   * Launches a scheduled task.
   *
   * @param {ScheduledTask} taskDocument
   *    The task's database document.
   */
  _launchTask(taskDocument) {
    const scheduledDate = this._getScheduledTime(taskDocument);
    const task = this._createTask(taskDocument._id, taskDocument.parameters);
    const now = new Date();
    if (scheduledDate.getTime() < now.getTime()) {
      // We are over due to execute this task. Start it immediately.

      // We need to define a value for the restart code. Otherwise, executeTask
      // will think this task was canceled.
      this._scheduledTasks[taskDocument._id] = { cancel: () => {} };
      this._executeTask(task, taskDocument);
    } else {
      this._scheduledTasks[taskDocument._id] = schedule.scheduleJob(scheduledDate,
        () =>
          this._executeTask(task, taskDocument)
        );
    }
  }

  /**
   * Starts a task, which previously was not started.
   *
   * @param {String} taskId
   *    The id of the task, which will be starting.
   */
  startTask(taskId) {
    const deferred = q.defer();

    if (this._scheduledTasks[taskId]) {
      const errorObject = errorHelper.createAndLogError('SchedulerService::stopTask',
        `Task [${taskId}] is already running.`);
      deferred.reject(errorObject);
      return deferred.promise;
    }

    scheduledTaskRepository.findById(taskId)
      .then((taskDoc) => {
        const wasEnabled = taskDoc.enable;
        const doc = taskDoc;
        doc.enable = true;
        scheduledTaskRepository.update(doc)
          .then((updatedDoc) => {
            const updatedDocument = updatedDoc;
            updatedDocument.enable = wasEnabled;
            this._launchTask(updatedDocument);
            deferred.resolve();
          })
          .catch((error) => {
            const errorObject = errorHelper.createAndLogError('SchedulerService::startTask',
              error);
            deferred.reject(errorObject);
          });
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('SchedulerService::startTask',
          error);
        deferred.reject(errorObject);
      });

    return deferred.promise;
  }

  /**
   * Stops the specified task, and disables it in the database.
   *
   * @param {String} taskId
   *    The id of the task to be canceled.
   */
  stopTask(taskId) {
    const deferred = q.defer();

    const task = this._scheduledTasks[taskId];
    if (!this._scheduledTasks[taskId]) {
      const errorObject = errorHelper.createAndLogError('SchedulerService::stopTask',
        `Task [${taskId}] is not currently running.`);
      deferred.reject(errorObject);
      return deferred.promise;
    }

    task.cancel();
    delete this._scheduledTasks.taskId;
    scheduledTaskRepository.findById(taskId)
      .then((taskDoc) => {
        const doc = taskDoc;
        doc.enable = false;
        scheduledTaskRepository.update(doc)
          .then(() => {
            deferred.resolve();
            delete this._scheduledTasks[taskId];
          })
          .catch((error) => {
            const errorObject = errorHelper.createAndLogError('SchedulerService::stopTask',
              error);
            deferred.reject(errorObject);
          });
      })
      .catch((error) => {
        const errorObject = errorHelper.createAndLogError('SchedulerService::stopTask',
          error);
        deferred.reject(errorObject);
      });
    return deferred.promise;
  }
}

module.exports = SchedulerService;
