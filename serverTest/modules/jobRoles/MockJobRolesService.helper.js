'use strict';

const q = require('q');


let nextId = 1;
let jobRolesList = undefined;
let jobRole = undefined;

class MockJobRolesService {
  get nextId() {
    return nextId;
  }


  get jobRolesList() {
    return jobRolesList;
  }

  set jobRolesList(value) {
    jobRolesList = value;
  }


  get jobRole() {
    return jobRole;
  }

  set jobRole(value) {
    jobRole = value;
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


  getJobRoles() {
    const deferred = q.defer();
    const resolvedObject = {
      docs: jobRolesList,
    };
    deferred.resolve(resolvedObject);
    return deferred.promise;
  }


  getJobRole() {
    const deferred = q.defer();
    deferred.resolve(jobRole);
    return deferred.promise;
  }


  update() {
    const deferred = q.defer();
    deferred.resolve();
    return deferred.promise;
  }
}

module.exports = MockJobRolesService;
