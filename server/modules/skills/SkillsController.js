'use strict';

const config = require('config');
const jwt = require('jwt-simple');
const jwtSecret = require('../../../config/secret.js');
const restUrl = config.get('domain.url');

class SkillsController {
  constructor(skillsService) {
    this._skillsService = skillsService;
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
  * Handles the request, to add a new skill to the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  * @param {Object}
  *   The Express HTTP response.
  */
  add(req, res) {
    /*
      resObj format
      It has two attributes status_code and message.
      If the status code is 201, then the new project is created and the url to
      the resource is set in the location header of the response.
      Else, send the response with error_code and message in JSON response body.
      */
      // series of validations to check if the required attributes are present in the request body
    if (!req.body.name) {
      this._sendErrorResponse(res,
        {
          status_code: 400,
          message: 'name attribute is mandatory',
        });
      return;
    }

    if (!req.body.description) {
      this._sendErrorResponse(res,
        {
          status_code: 400,
          message: 'description attribute is mandatory',
        });
      return;
    }

    if (!req.body.category_id) {
      this._sendErrorResponse(res,
        {
          status_code: 400,
          message: 'category_id attribute is mandatory',
        });
      return;
    }

    // Get the user who inovked this api
    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret());

    const name = req.body.name;
    const description = req.body.description;
    const categoryId = req.body.category_id;
    const creatorUserId = decoded.iss;
    const isTrending = req.body.trending;

    this._skillsService.addSkill(name, description, categoryId, creatorUserId, isTrending)
      .then((id) => {
        res.status(201)
          .location(`${restUrl}/v1/skills/${id}`)
          .send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }

  /*
  * Handles requests to update a skill in the database,
  *
  * @param {Object} req
  *    The Express request.
  * @param {Object} res
  *    The Express response.
  */
  update(req, res) {
    const skillId = req.params.skillId;
    const name = req.body.name;
    const description = req.body.description;
    const trending = req.body.trending;

    // Get the user who inovked this api
    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret());
    const modifierUserId = decoded.iss;

    /*
      resObj format
      It has two attributes status_code and message.
      If the status code is 204, then return the response without any body.
      Else, send the response with error_code and message in JSON response body.
      */
    this._skillsService.updateSkill(skillId, name, description, trending,
      modifierUserId).then((resObj) => {
        res.status(resObj.status_code)
          .location(`${restUrl}/v1/skills/${resObj.message}`)
          .send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


  /*
  * Handles the request to delete a skill.
  *
  * @param {Object} req
  *    The Express request.
  * @param {Object} res
  *    The Express response.
  */
  delete(req, res) {
    const skillId = req.params.skillId;

    /*
      resObj format
      It has two attributes status_code and message.
      If the status code is 204, then return the response without any body.
      Else, send the response with error_code and message in JSON response body.
      */
    this._skillsService.deleteSkill(skillId)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


/*
 * Handles requests for a single skill, from the database.
 *
 * @param {Object} req
 *    The Express request.
 * @param {Object} res
 *    The Express response.
 */
  getSkill(req, res) {
    const skillId = req.params.skillId; // get skill ID from the url
    const relatedSkills = (req.query.relatedSkills.indexOf('true') > -1);
    const manager = req.query.manager;


    /*
      resObj format
      It has two attributes status_code and message.
      If the status code is 200, then return the response with project retrieved.
      Else, send the response with error_code and message in JSON response body.
      */
    this._skillsService.getSkill(skillId,
      manager,
      relatedSkills)
      .then((resObj) => {
        res.status(200).json(resObj.message);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


  /*
  * Handles requests to get multiple skills, from the database.
  *
  * @param {Object} req
  *    The Express request.
  * @param {Object} res
  *    The Express response.
  */
  getSkills(req, res) {
    const category = req.query.category;
    const manager = req.query.manager;

    const view = req.query.view;

    /*
      resObj format
      It has two attributes status_code and message.
      If the status code is 200, then return the response with project retrieved.
      Else, send the response with error_code and message in JSON response body.
      */
    this._skillsService.getSkills(manager,
      category,
      view)
      .then((resObj) => {
        res.status(resObj.status_code)
          .json(resObj.message);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }
}

module.exports = SkillsController;
