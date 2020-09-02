'use strict';

const q = require('q');

const Model = require('../../models/Model');

/**
 * Repository for interacting with the categories database.
 */
class CategoriesRepository {
  /**
   * Creates a new category document, or updates an existing document.
   * If a _rev is contained within the document, and that _rev
   * matches the latest revision for that document, then the document will be updated.
   *
   * @param {Category} categoryDocument
   *    The document to be saved to the database.
   *
   * @returns {Promise}
   *    The promise to save the category document.
   */
  createOrUpdate(categoryDocument) {
    const deferred = q.defer();

    Model.insertDocument(Model.Databases.CATEGORIES,
      categoryDocument,
      categoryDocument._id,
      categoryDocument._rev)
      .then((doc) => {
        if (doc._id) {
          deferred.resolve(doc._id);
        } else {
          const resObj = {};
          resObj.status_code = 500;
          resObj.message = 'Could not save the Category';
          deferred.reject(resObj);
        }
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Failed to update Category. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Deletes a category document, from the database.
   *
   * @param {Category} document
   *    The document to be deleted.
   *
   * @returns {Promise}
   *    The promise to delete the document.
   */
  delete(document) {
    const deferred = q.defer();

    Model.destroyDocument(Model.Databases.CATEGORIES, document._id, document._rev)
      .then((doc) => {
        deferred.resolve(doc._id);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Failed to delete Category with id ${document._id}. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds a category document by its id.
   *
   * @param {String} id
   *    The id of the document.
   * @returns {q.defer}
   *    The promise to return the document.
   */
  findById(id) {
    const deferred = q.defer();

    Model.retrieveDocumentsById(Model.Databases.CATEGORIES, [id], true)
      .then((categoryDoc) => {
        if (categoryDoc === undefined) {
          const resObj = {};
          resObj.status_code = 404;
          resObj.message = 'Category not found';
          deferred.reject(resObj);
        }

        deferred.resolve(categoryDoc);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Category not found. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Returns all of the categories.
   *
   * @returns {q.defer}
   *    The promise to return all of the categories.
   */
  findAll() {
    const deferred = q.defer();

    const categoryQuery = {
      selector: { name: { $regex: '^.*' } },
    };
    Model.queryDocuments(Model.Databases.CATEGORIES, categoryQuery)
      .then((categoriesDocs) => {
        deferred.resolve(categoriesDocs);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Categories not found. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = CategoriesRepository;
