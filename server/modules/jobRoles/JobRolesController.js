'use strict';


const _ = require('underscore');
const config = require('config');
const jwt = require('jwt-simple');
const jwtSecret = require('../../../config/secret.js');

const restUrl = config.get('domain.url');

/**
 * REST Controller for the JobRole Resource.
 */
class JobRolesController {
  constructor(jobRolesService) {
    this._jobRolesService = jobRolesService;
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
  * Handles the request, to add a new job role to the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  *   Body Parameters:
  *     name: The name of the new Job Role.
  *     description: The description of the new Job Role.
  * @param {Object}
  *   The Express HTTP response.
  */
  add(req, res) {
    const name = req.body.name;
    const description = req.body.description;

    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret()); // get the user who invoked the api.

    const creatorUserId = decoded.iss;

    if (_.isEmpty(name)) {
      this._sendErrorResponse(res,
        {
          status_code: 400,
          message: 'name attribute is mandatory',
        });
      return;
    }

    this._jobRolesService.add(name,
      description,
      creatorUserId)
      .then((id) => {
        res.status(201)
          .location(`${restUrl}/v1/admin/jobroles/${id}`)
          .send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


 /**
  * Handles the request, to delete a new job role to the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  *   Path Parameters:
  *     id: The job Role that will be deleted.
  * @param {Object}
  *   The Express HTTP response.
  */
  delete(req, res) {
    const id = req.params.jobRoleId; // job role id

    this._jobRolesService.delete(id)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


 /**
  * Handles the request, to get a job role from the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  *   Path Parameters:
  *     id: The job Role that will be fetched.
  * @param {Object}
  *   The Express HTTP response.
  */
  getJobRole(req, res) {
    const id = req.params.jobRoleId;


    this._jobRolesService.getJobRole(id)
      .then((doc) => {
        const result = {
          item: doc,
          kind: 'Resource#JobRoleDetails',
        };
        res.status(200).json(result);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }

  /**
   * Handles the request, to get all of job roles from the database.
   *
   * @param {Object} req
   *   The Express HTTP request.
   *   Query Parameters:
   *     limit: The maximum number of job roles that will be returned.
   *     offset: The position of the first record that will be returned.
   * @param {Object}
   *   The Express HTTP response.
   */
  getJobRoles(req, res) {
    let limit = req.query.limit;
    let offset = req.query.offset;

    // Validations
    if (offset === undefined || offset === '') {
      offset = 0; // defaulted to 0 if not provided
    } else {
      offset = parseInt(offset, 10);
      if (isNaN(offset)) {
        this._sendErrorResponse(res, {
          status_code: 400,
          message: 'offset query parameter must be an integer greater than or equal to zero.',
        });
        return;
      }
    }

    if (limit === undefined || limit === '') {
      limit = 0;
    } else {
      limit = parseInt(limit, 10);
      if (isNaN(limit)) {
        this._sendErrorResponse(res, {
          status_code: 400,
          message: 'limit query parameter must be an integer greater than or equal to zero.',
        });
        return;
      }
    }


    this._jobRolesService.getJobRoles(limit, offset)
      .then((documents) => {
        const result = {
          items: documents.docs,
          kind: 'Resource#JobRolesList',
        };
        res.status(200).json(result);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }

  /**
   * Handles the request, to update a job role in the database.
   *
   * @param {Object} req
   *   The Express HTTP request.
   *   Body Parameters:
   *     name: The name of the new Job Role.
   *     description: The description of the new Job Role.
   *   Path Parameters:
   *     jobRoleId: The id of the JobRole that will be updated.
   * @param {Object}
   *   The Express HTTP response.
   */
  updateJobRoles(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const jobRoleId = req.params.jobRoleId;

    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret()); // get the user who invoked the api.

    const modifierUserId = decoded.iss;
    this._jobRolesService.update(jobRoleId,
      name,
      description,
      modifierUserId)
      .then(() => {
        res.send(204);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }
}

module.exports = JobRolesController;
