'use strict';


const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testCategoryDatabase = {};
let nextId = 1;

class MockCategoriesRepository {
  constructor() {
    this.testCategoryDatabase = testCategoryDatabase;
    this.nextId = nextId;
  }


  clearDatabase() {
    for (const prop in testCategoryDatabase) {
      if (testCategoryDatabase.hasOwnProperty(prop)) {
        delete testCategoryDatabase[prop];
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
    testCategoryDatabase[id] = updatedDoc;

    deferred.resolve(id);
    return deferred.promise;
  }
  delete(categoryDocument) {
    const deferred = q.defer();

    delete testCategoryDatabase[categoryDocument._id];
    deferred.resolve(categoryDocument._id);
    return deferred.promise;
  }
  findAll() {
    const deferred = q.defer();

    let categories = [];
    for (const prop in testCategoryDatabase) {
      if (testCategoryDatabase.hasOwnProperty(prop)) {
        const category = testCategoryDatabase[prop];
        categories.push(category);
      }
    }
    categories = DatabaseHelper.convertArrayToQueryData(categories);
    deferred.resolve(categories);
    return deferred.promise;
  }


  findById(id) {
    const deferred = q.defer();

    deferred.resolve(testCategoryDatabase[id]);
    return deferred.promise;
  }
}

module.exports = MockCategoriesRepository;
