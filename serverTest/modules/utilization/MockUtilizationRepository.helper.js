'use strict';


const _ = require('underscore');
const q = require('q');


const DatabaseHelper = require('../../Database.helper');


const testUtilizationDatabase = {};
let nextId = 1;


class MockUtilizationRepository {
  constructor() {
    this.testUtilizationDatabase = testUtilizationDatabase;
  }


  clearDatabase() {
    for (const prop in testUtilizationDatabase) {
      if (testUtilizationDatabase.hasOwnProperty(prop)) {
        delete testUtilizationDatabase[prop];
      }
    }
  }


  createOrUpdate(utilizationDocument) {
    const deferred = q.defer();

    // Adding the document to the faked out database.
    const id = (utilizationDocument._id)
      ? utilizationDocument._id
      : nextId;
    ++nextId;

    const updatedDoc = utilizationDocument;
    updatedDoc._id = id;
    testUtilizationDatabase[id] = updatedDoc;

    deferred.resolve(id);
    return deferred.promise;
  }

  findByJobRoleName(jobRoleName) {
    const deferred = q.defer();

    let utilizations = [];
    let isUtilizationAdded = false;
    for (const utilization in testUtilizationDatabase) {
      if (testUtilizationDatabase.hasOwnProperty(utilization)) {
        const utilizationProjects = testUtilizationDatabase[utilization].projects;
        for (let iProj = 0; iProj < utilizationProjects.length; ++iProj) {
          const utilizationProjectUtil = utilizationProjects[iProj].utilization;
          for (let iUtil = 0; iUtil < utilizationProjectUtil.length; ++iUtil) {
            if (utilizationProjectUtil[iUtil].job_role === jobRoleName) {
              utilizations.push(testUtilizationDatabase[utilization]);
              isUtilizationAdded = true;
              break;
            }
          }

          // If we added the util already, stop checking this utilization.
          if (isUtilizationAdded) {
            break;
          }
        }
      }
    }
    utilizations = DatabaseHelper.convertArrayToQueryData(utilizations);
    deferred.resolve(utilizations);

    return deferred.promise;
  }


  findByManager(frontBookmark,
    limit,
    offset,
    managerId) {
    const deferred = q.defer();

    const utilizations = [];
    _.each(testUtilizationDatabase, (util) => {
      if (util.reports_to === managerId) {
        utilizations.push(util);
      }
    });
    deferred.resolve(utilizations);

    return deferred.promise();
  }


  findByUpdatedDateOutsideDateRange(endDate) {
    const deferred = q.defer();

    const utilizations = [];
    _.each(testUtilizationDatabase, (util) => {
      if (util.updated_date < endDate) {
        utilizations.push(util);
      }
    });
    deferred.resolve(utilizations);

    return deferred.promise;
  }


  findByUserId(userId) {
    const deferred = q.defer();

    let utilization = undefined;
    for (const util in testUtilizationDatabase) {
      if (testUtilizationDatabase.hasOwnProperty(util)
        && util.user_id === userId) {
        utilization = util;
        break;
      }
    }
    deferred.resolve(utilization);

    return deferred.promise;
  }


  updateList(utilizationDocuments) {
    const deferred = q.defer();

    _.each(utilizationDocuments, (util) => {
      testUtilizationDatabase[util._id] = util;
    });
    deferred.resolve();

    return deferred.promise;
  }
}

module.exports = MockUtilizationRepository;
