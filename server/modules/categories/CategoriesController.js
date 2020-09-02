'use strict';


const jwt = require('jwt-simple');
const config = require('config');
const jwtSecret = require('../../../config/secret.js');
const restUrl = config.get('domain.url');


/**
 * Controller for the categories REST resource. This controller handles all of the HTTP requests,
 * for this resource.
 */
class CategoriesController {
  constructor(categoriesService) {
    this._categoriesService = categoriesService;
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
  * Handles the request, to add a new category to the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  *   Body Parameters:
  *     name: The name of the category.
  *     description: The description of the category.
  * @param {Object}
  *   The Express HTTP response.
  */
  add(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret()); // get the user who invoked the api

    if (!name) {
      this._sendErrorResponse(res,
        {
          status_code: 400,
          message: 'name attribute is mandatory',
        });
      return;
    }


    this._categoriesService.add(name,
      description,
      decoded.iss)
      .then((id) => {
        res.status(201)
          .location(`${restUrl}/v1/admin/categories/${id}`)
          .send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }

  /**
   * Handles the request, to delete a new category to the database.
   *
   * @param {Object} req
   *   The Express HTTP request.
   *   Path Parameters:
   *     categoryId: The id of the category to be deleted.
   * @param {Object}
   *   The Express HTTP response.
   */
  delete(req, res) {
    const id = req.params.categoryId;

    this._categoriesService.delete(id)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


 /**
  * Handles the request, to get all categories in the database.
  *
  * @param {Object} req
  *   The Express HTTP request.
  * @param {Object}
  *   The Express HTTP response.
  */
  getCategories(req, res) {
    this._categoriesService.getCategoriesList()
      .then((documents) => {
        res.status(200).json(documents);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }


  /**
   * Handles the request, to get a category by its id.
   *
   * @param {Object} req
   *   The Express HTTP request.
   *   Path Parameters:
   *     categoryId: The id of the category to be returned.
   * @param {Object}
   *   The Express HTTP response.
   */
  getCategory(req, res) {
    const id = req.params.categoryId;

    this._categoriesService.getCategory(id)
      .then((doc) => {
        const responseObject = {
          item: doc,
          kind: 'Resource#CategoryDetails',
        };

        res.status(200).json(responseObject);
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }

  /**
   * Handles the request, to update a category by its id.
   *
   * @param {Object} req
   *   The Express HTTP request.
   *   Path Parameters:
   *     categoryId: The id of the category to be returned.
   *   Body Parameters:
   *     name: The name of the category.
   *     description: The description of the category.
   * @param {Object}
   *   The Express HTTP response.
   */
  updateCategory(req, res) {
    const categoryId = req.params.categoryId;
    const description = req.body.description;
    const name = req.body.name;

    // Get the user who invoked the api
    const token = req.headers['x-access-token'];
    const decoded = jwt.decode(token, jwtSecret());

    const modifierUserId = decoded.iss;


    this._categoriesService.update(categoryId,
      name,
      description,
      modifierUserId)
      .then(() => {
        res.status(204).send();
      })
      .catch((error) => {
        this._sendErrorResponse(res, error);
      });
  }
}

module.exports = CategoriesController;
