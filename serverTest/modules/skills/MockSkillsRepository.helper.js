'use strict';


const _ = require('underscore');
const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testSkillDatabase = {};


/**
 * Mock repository used in service tests.
 */
class MockSkillsRepository {
  constructor() {
    this.testSkillDatabase = testSkillDatabase;
  }


  clearDatabase() {
    for (const prop in testSkillDatabase) {
      if (testSkillDatabase.hasOwnProperty(prop)) {
        delete testSkillDatabase[prop];
      }
    }
  }

  delete(skillId) {
    const deferred = q.defer();

    delete testSkillDatabase[skillId];
    deferred.resolve(skillId);

    return deferred.promise;
  }


  deleteList(skillList) {
    const deferred = q.defer();

    _.each(skillList, (skill) => {
      delete testSkillDatabase[skill._id];
    });
    deferred.resolve();
    return deferred.promise;
  }


  findByCategory(categoryId) {
    const deferred = q.defer();

    let skills = [];
    for (const prop in testSkillDatabase) {
      if (testSkillDatabase.hasOwnProperty(prop)) {
        const skill = testSkillDatabase[prop];
        if (skill.category_id === categoryId) {
          skills.push(skill);
        }
      }
    }
    skills = DatabaseHelper.convertArrayToViewData(skills);
    deferred.resolve(skills);

    return deferred.promise;
  }


  updateList(skillList) {
    const deferred = q.defer();

    _.each(skillList, (skill) => {
      testSkillDatabase[skill._id] = skill;
    });
    deferred.resolve();
    return deferred.promise;
  }
}

module.exports = MockSkillsRepository;
