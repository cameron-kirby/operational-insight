'use strict';


const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testJobRolesDatabase = {};
let nextId = 1;

class MockCategoriesRepository {
  constructor() {
    this.testJobRolesDatabase = testJobRolesDatabase;
    this.nextId = nextId;
  }


  clearDatabase() {
    for (const prop in testJobRolesDatabase) {
      if (testJobRolesDatabase.hasOwnProperty(prop)) {
        delete testJobRolesDatabase[prop];
      }
    }
  }


  createOrUpdate(categoryDoc) {
    const deferred = q.defer();

    // Adding the document to the faked out database.
    const id = (categoryDoc._id)
      ? categoryDoc._id
      : nextId;
    ++nextId;

    const updatedDoc = categoryDoc;
    updatedDoc._id = id;
    testJobRolesDatabase[id] = updatedDoc;

    deferred.resolve(id);
    return deferred.promise;
  }
  delete(categoryDocument) {
    const deferred = q.defer();

    delete testJobRolesDatabase[categoryDocument._id];
    deferred.resolve(categoryDocument._id);
    return deferred.promise;
  }
  findAll() {
    const deferred = q.defer();

    let jobRoles = [];
    for (const prop in testJobRolesDatabase) {
      if (testJobRolesDatabase.hasOwnProperty(prop)) {
        const category = testJobRolesDatabase[prop];
        jobRoles.push(category);
      }
    }
    jobRoles = DatabaseHelper.convertArrayToQueryData(jobRoles);
    deferred.resolve(jobRoles);
    return deferred.promise;
  }


  findById(id) {
    const deferred = q.defer();

    deferred.resolve(testJobRolesDatabase[id]);
    return deferred.promise;
  }
}

module.exports = MockCategoriesRepository;
