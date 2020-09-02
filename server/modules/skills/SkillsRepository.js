'use strict';

const _ = require('underscore');
const q = require('q');

const Model = require('../../models/Model');

/**
 * Repository for interacting, with the skills database.
 */
class SkillsRepository {

  /**
   * Creates a new skill document, or updates an existing document.
   * If a _rev is contained within the skillDocument, and that _rev
   * matches the latest revision for that document, then the document will be updated.
   *
   * @param {Skill} skillDocument
   *    The document to be saved to the database.
   *
   * @returns {q.defer}
   *    The promise to save the skill document.
   */
  createOrUpdate(skillDocument) {
    const deferred = q.defer();

    Model.insertDocument(Model.Databases.SKILLS,
     skillDocument,
     skillDocument._id,
     skillDocument._rev)
      .then((doc) => {
        if (doc._id) {
          deferred.resolve(doc._id);
        } else {
          const resObj = {};
          resObj.status_code = 500;
          resObj.message = 'Could not save the Skill';
          deferred.reject(resObj);
        }
      })
      .catch((err) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not save the Skill. Error was ${err.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }

  /**
   * Deletes a skills document, using its id, and revision as indices.
   *
   * @param {String} document
   *    The skills document that will be destroyed.
   *
   * @returns {q.defer}
   *    The promise to delete the document.
   */
  delete(document) {
    const deferred = q.defer();

    Model.destroyDocument(Model.Databases.SKILLS, document._id, document._rev)
      .then((doc) => {
        deferred.resolve(doc.id);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not delete the Skill. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Deletes a list of skills from the database.
   *
   * @param {Skill[]} documentList
   *    The list of documents to be deleted.
   *
   * @returns {Promise}
   *    The promise to delete the documents.
   */
  deleteList(documentList) {
    const deferred = q.defer();

    Model.bulk(Model.Databases.SKILLS, { docs: documentList }, true)
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not delete the list of Skills. Error was ${error.errorJSON}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all of the skills in the database.
   *
   * @returns {q.defer}
   *    The promise to return all of the skills.
   */
  findAll() {
    const deferred = q.defer();

    Model.queryView(Model.Databases.SKILLS, 'skillsView')
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Could not retrieve all skills. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  findByCategory(categoryId) {
    const deferred = q.defer();

    const keys = {
      key: categoryId,
    };

    Model.queryView(Model.Databases.SKILLS, 'category_id', keys)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Skills for category ${categoryId} not found. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }

  /**
   * Finds a Skills document by its id.
   *
   * @param {String} id
   *    The id of the document.
   *
   * @returns {q.defer}
   *    The promise to return document.
   */
  findById(id) {
    const deferred = q.defer();

    Model.retrieveDocumentsById(Model.Databases.SKILLS, [id], true)
      .then((doc) => {
        if (doc === undefined) {
          const resObj = {};
          resObj.status_code = 404;
          resObj.message = 'Skill not found';
          deferred.reject(resObj);
        }

        deferred.resolve(doc);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Skill not found. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all of the skills for a given manager. If 'all' is used
   * as the managerId, then the skills for all teams will be returned.
   *
   * @param {String} managerId
   *    The id of the manager.
   *
   * @returns {q.defer}
   *    The promise to return all of the skills for that manager.
   */
  findByManager(managerId) {
    const deferred = q.defer();

    const keys = (managerId === 'all') ? undefined : {
      key: [managerId],
    };

    Model.queryView(Model.Databases.SKILLS, 'managers', keys)
    .then((skillsDocs) => {
      deferred.resolve(skillsDocs);
    })
    .catch((error) => {
      const resObj = {};
      resObj.status_code = 404;
      resObj.message = `Skills for manager ${managerId} not found. Error was ${error}`;
      deferred.reject(resObj);
    });

    return deferred.promise;
  }


  /**
   * Finds all of the skills in the supplied category, for
   * a given manager.
   *
   * @param {String} managerId
   *    The id(s) of the manager, whose skills are being fetched.
   * @param {String} categoryId
   *    The id(s) of the category, of the skills being fetched.
   *
   * @returns {q.defer}
   *    The promise to return the skills, in the specified category for that manager.
   */
  findByManagerAndCategory(managerId,
    categoryId) {
    const deferred = q.defer();

    const keys = [];
    const managersIdArray = (managerId.constructor === Array) ? managerId : [managerId];
    const categoriesIdArray = (categoryId.constructor === Array) ? categoryId : [categoryId];

    _.each(managersIdArray, (manager) => {
      _.each(categoriesIdArray, (category) => {
        keys.push([manager, category]);
      });
    });

    const params = {
      keys,
    };

    Model.queryView(Model.Databases.SKILLS, 'managers_catID', params)
    .then((docs) => {
      deferred.resolve(docs);
    })
    .catch((error) => {
      const resObj = {};
      resObj.status_code = 500;
      resObj.message = `Skills in category [${categoryId}] for manager ${managerId},`
       + ` are not found. Error was ${error}`;
      deferred.reject(resObj);
    });

    return deferred.promise;
  }


  /**
   * Updates a group of skill documents at one time.
   *
   * @param {Skill[]} skillDocuments
   *    An array of user documents.
   *
   * @returns {Promise}
   *    The promise to update all of the skill documents.
   */
  updateList(skillDocuments) {
    const deferred = q.defer();

    Model.bulk(Model.Databases.SKILLS, { docs: skillDocuments })
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Bulk Skills update failed. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = SkillsRepository;
