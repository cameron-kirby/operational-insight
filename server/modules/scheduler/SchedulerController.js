'use strict';


/**
 * Controller for the Scheduler REST Resource.
 */
class SchedulerController {
  constructor(schedulerService) {
    this._schedulerService = schedulerService;
  }


  /**
   * Returns the ScheduledTask with the specified id.
   *
   * @param {Object} request
   *    The Express request.
   * @param {Object} response
   *    The Express response.
   */
  findById(request, response) {
    const taskId = request.params.taskId;

    this._schedulerService.findById(taskId)
      .then((document) =>
        response.status(200).json(document)
      )
      .catch((error) =>
        response.status(error.status).send(error.message)
      );
  }
}

module.exports = SchedulerController;
