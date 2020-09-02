'use strict';


const q = require('q');


let nextId = 1;
let categoriesList = undefined;
let category = undefined;

class MockCategoriesService {
  get nextId() {
    return nextId;
  }


  get categoriesList() {
    return categoriesList;
  }

  set categoriesList(value) {
    categoriesList = value;
  }


  get category() {
    return category;
  }

  set category(value) {
    category = value;
  }


  add() {
    const deferred = q.defer();

    ++nextId;
    deferred.resolve(nextId);
    return deferred.promise;
  }


  delete() {
    const deferred = q.defer();
    deferred.resolve();
    return deferred.promise;
  }


  getCategoriesList() {
    const deferred = q.defer();
    deferred.resolve(categoriesList);
    return deferred.promise;
  }


  getCategory() {
    const deferred = q.defer();
    deferred.resolve(category);
    return deferred.promise;
  }


  update() {
    const deferred = q.defer();
    deferred.resolve();
    return deferred.promise;
  }
}

module.exports = MockCategoriesService;
