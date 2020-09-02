'use strict';


const _ = require('underscore');
const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testProjectsDatabase = {};


class MockProjectsRepository {
  constructor() {
    this.testProjectsDatabase = testProjectsDatabase;
  }


  clearDatabase() {
    for (const prop in testProjectsDatabase) {
      if (testProjectsDatabase.hasOwnProperty(prop)) {
        delete testProjectsDatabase[prop];
      }
    }
  }


  findByJobRoleName(jobRoleName) {
    const deferred = q.defer();

    let projects = [];
    for (const project in testProjectsDatabase) {
      if (testProjectsDatabase.hasOwnProperty(project)) {
        const projectTeam = testProjectsDatabase[project].team;
        for (let iUser = 0; iUser < projectTeam.length; ++iUser) {
          if (projectTeam[iUser].job_role === jobRoleName) {
            projects.push(testProjectsDatabase[project]);
            break;
          }
        }
      }
    }
    projects = DatabaseHelper.convertArrayToQueryData(projects);
    deferred.resolve(projects);

    return deferred.promise;
  }
  updateList(projectDocuments) {
    const deferred = q.defer();

    _.each(projectDocuments, (project) => {
      testProjectsDatabase[project._id] = project;
    });
    deferred.resolve();

    return deferred.promise;
  }
}

module.exports = MockProjectsRepository;
