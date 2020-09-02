'use strict';

const _ = require('underscore');
const q = require('q');

const Model = require('../../models/Model');

/**
 * Repository for interacting with the users database.
 */
class UsersRepository {
  /**
   * Finds all of the user's that have a skill in the specified skill category.
   *
   * @param {Number} categoryId
   *    The id of the category searched for.
   *
   * @returns {Promise}
   *    The promise to return all of the user's that have a skill in the given category.
   */
  findByCategory(categoryId) {
    const deferred = q.defer();

    const query = {
      selector: {
        skills: {
          $elemMatch: {
            category_id: categoryId,
          },
        },
      },
    };


    Model.queryDocuments(Model.Databases.USERS, query)
      .then((docs) => {
        deferred.resolve(docs);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Could not find the users with a skill from category ${categoryId}.
          Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds all users with a given manager and skill.
   *
   * @param {String} managerId
   *    The id(s) of the user's manager.
   * @param {String} skillId
   *    The id(s) of the skill.
   *
   * @returns {q.defer}
   *    The promise to return all users, of a manager with the skill.
   */
  findByManagerAndSkill(managerId, skillId) {
    const deferred = q.defer();

    const keys = [];
    const managersIdArray = (managerId.constructor === Array) ? managerId : [managerId];
    const skillIdArray = (skillId.constructor === Array) ? skillId : [skillId];

    _.each(managersIdArray, (manager) => {
      _.each(skillIdArray, (skill) => {
        keys.push([manager, skill]);
      });
    });

    const params = {
      keys,
    };

    Model.queryView(Model.Databases.USERS, 'usersView', params)
    .then((userDocs) => {
      deferred.resolve(userDocs);
    })
    .catch((error) => {
      const resObj = {};
      resObj.status_code = 404;
      resObj.message = `Could not find the users of manager ${managerId}. `
        + `with skill ${skillId}. Error was ${error}`;
      deferred.reject(resObj);
    });

    return deferred.promise;
  }


  /**
   * Finds all of the users that have the specified skill.
   *
   * @param {String} skillId,
   *    The id of the skill searched for.
   *
   * @returns {q.defer}
   *    The promise to return all of the users, with the specified skill.
   */
  findBySkill(skillId) {
    const deferred = q.defer();

    const params = {
      key: skillId,
    };

    Model.queryView(Model.Databases.USERS, 'skill_id', params)
      .then((documents) => {
        deferred.resolve(documents);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Could not find the users. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Finds the skill category count for each user.
   *
   * @returns {q.defer}
   *    The promise to return the skill category count for each user.
   */
  findSkillCountByCategory() {
    const deferred = q.defer();

    const keys = {
      include_docs: false,
      group: true,
    };

    Model.queryView(Model.Databases.USERS, 'skillCountByCategory', keys)
      .then((docs) => {
        deferred.resolve(docs);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Could not find the users. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Updates a group of user documents at one time.
   *
   * @param {Users[]} usersDocuments
   *    An array of user documents.
   *
   * @returns {q.defer}
   *    The promise to update all of the user documents.
   */
  updateList(usersDocuments) {
    const deferred = q.defer();

    Model.bulk(Model.Databases.USERS, { docs: usersDocuments })
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 404;
        resObj.message = `Could not save the users. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }
}

module.exports = UsersRepository;
