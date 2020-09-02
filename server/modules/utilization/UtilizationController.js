'use strict';

/**
 * REST Controller for the Utilization Resource.
 */
class UtilizationController {
  /**
   * Constructs a new UtilizationController using the supplied utilizationService.
   *
   * @param {UtilizationService} utilizationService
   *    The service responsible for interacting with utilizations.
   */
  constructor(utilizationService) {
    this._utilizationService = utilizationService;
  }


  /**
   * Sends an error response containing the supplied message.
   *
   * @param {Response} response
   *  The Express HTTP response object.
   * @param {Object} responseMessage
   *  The message being sent in the response.
   */
  _sendErrorResponse(response, responseMessage) {
    response.status(responseMessage.status_code).json({
      error_code: responseMessage.status_code,
      message: responseMessage.message,
    });
  }


  /**
   * Parses the HTTP request for finding a list of utilizations.
   *
   * @param {Object} request
   *    The Express HTTP request.
   *    Query Parameters:
   *      boomark: The id of the user whose utilization is being upated.
   *      limit: The maximum number of utilizations that will be returned.
   *      offset: The offset of the query.
   *      year: The year of the desired utilizations.
   *      manager: The id of the manager.
   * @param {Object} response
   *    The Express HTTP response.
   */
  findList(request, response) {
    const frontBookmark = request.query.bookmark;
    const limit = request.query.limit;
    let offset = request.query.offset;
    const dateFilter = request.query.year;
    const manager = request.query.manager;

    if (offset === undefined || offset === '') {
      offset = 0;
    }

    const startDate = Math.round(new Date(dateFilter, 0, 1).getTime());
    const endDate = Math.round(new Date(dateFilter, 11, 31).getTime());

    this._utilizationService.findByManagerAndDateRange(frontBookmark,
      limit,
      offset,
      manager,
      startDate,
      endDate)
      .then((utilizationDocuments) => {
        response.status(200).json(utilizationDocuments);
      })
      .catch((error) => {
        this._sendErrorResponse(response, error);
      });
  }


  /**
   * Parses the HTTP request for finding a user's utilizations.
   *
   * @param {Object} request
   *    The Express HTTP request.
   *    Path Parameters:
   *      userId: The id of the user.
   *    Query Parameters:
   *      offset: The offset of the query.
   *      year: The year of the desired utilizations.
   * @param {Object} response
   *    The Express HTTP response.
   */
  findOne(request, response) {
    let offset = request.query.offset;
    const dateFilter = request.query.year;
    const userId = request.params.userId;

    const startDate = Math.round(new Date(dateFilter, 0, 1).getTime());
    const endDate = Math.round(new Date(dateFilter, 11, 31).getTime());


    if (offset === undefined || offset === '') {
      offset = 0; // defaulted to 0 if not provided
    }


    this._utilizationService.findByUserIdAndDateRange(userId,
      startDate,
      endDate)
      .then((utilizationDocuments) => {
        response.status(200).json(utilizationDocuments);
      })
      .catch((error) => {
        this._sendErrorResponse(response, error);
      });
  }


  /**
   * Parases the HTTP request for validating a user's utilization.
   *
   * @param {Object} request
   *    The Express HTTP request.
   *    Path Parameters:
   *      id: The id of the user whose utilization is being upated.
   * @param {Object} response
   *    The Express HTTP response.
   */
  validate(request, response) {
    const userId = request.params.id;

    this._utilizationService.validate(userId)
      .then(() =>
        response.status(200).send()
      )
      .catch((error) =>
        this._sendErrorResponse(response, error)
      );
  }
}

module.exports = UtilizationController;
