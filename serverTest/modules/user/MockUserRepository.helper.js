'use strict';


const _ = require('underscore');
const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testUserDatabase = {};

class MockUserRepository {
  constructor() {
    this.testUserDatabase = testUserDatabase;
  }


  clearDatabase() {
    for (const prop in testUserDatabase) {
      if (testUserDatabase.hasOwnProperty(prop)) {
        delete testUserDatabase[prop];
      }
    }
  }


  findByCategory(categoryId) {
    const deferred = q.defer();

    let users = [];
    for (const prop in testUserDatabase) {
      if (testUserDatabase.hasOwnProperty(prop)) {
        const user = testUserDatabase[prop];
        for (let iSkill = 0; iSkill < user.skills.length; ++iSkill) {
          if (user.skills[iSkill].category_id === categoryId) {
            users.push(user);
            break;
          }
        }
      }
    }
    users = DatabaseHelper.convertArrayToQueryData(users);
    deferred.resolve(users);


    return deferred.promise;
  }


  updateList(userList) {
    const deferred = q.defer();

    _.each(userList, (user) => {
      testUserDatabase[user._id] = user;
    });
    deferred.resolve();
    return deferred.promise;
  }
}

module.exports = MockUserRepository;
