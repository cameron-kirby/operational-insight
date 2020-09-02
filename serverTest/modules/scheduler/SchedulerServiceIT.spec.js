'use strict';

const _ = require('underscore');
const q = require('q');

const Model = require('../../../server/models/Model');

const databaseHelper = require('../../Database.helper');
const schedulerHelper = require('./Scheduler.helper');

const Duration = require('../../../server/modules/utils/Duration');
const Factory = require('../../../server/modules/utils/Factory');

const UtilizationValidationEmailTask = require('../../../server/modules/'
  + 'scheduler/utilizationValidationEmail/UtilizationValidationEmailTask');
const SchedulerService = require('../../../server/modules/scheduler/SchedulerService');


const factory = new Factory();
const expireDuration = new Duration();
expireDuration.weeks = 2;

const tokenDuration = new Duration();
tokenDuration.days = 1;

const testUser = 'jcarroll@us.ibm.com';

const fakeUtilizationService = {
  /**
   * Fake to only return the test user. Otherwise real users could receive test data.
   */
  findUnverifiedUtilizations: () => {
    const deferred = q.defer();

    _.delay(() => {
      deferred.resolve({
        rows: [{ user_id: testUser }],
      });
    }, 250);

    return deferred.promise;
  },
};

factory.add('testUtilizationVerificationEmail',
  UtilizationValidationEmailTask,
  {
    utilizationService: fakeUtilizationService,
  });

function createTestDocument(done) {
  const testDocument = schedulerHelper.getTemplate();
  const duration = new Duration();
  duration.seconds = 5;
  testDocument.frequency = duration;

  testDocument.parameters = {
    documentId: 'testUtilizationVerificationEmail',
    verifyDuration: expireDuration,
    tokenDuration,
    subject: `${new Date()} Test: SchedulerServiceIT}`,
  };

  databaseHelper.createOrUpdate(Model.Databases.SCHEDULED_TASK, '_id',
   testDocument._id, testDocument)
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
    });
}

function clearTestDocument(done) {
  // Need to disable the test scheduled task.
  const testDocument = schedulerHelper.getTemplate();

  databaseHelper.createOrUpdate(Model.Databases.SCHEDULED_TASK,
    '_id', testDocument._id, testDocument)
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
    });
}

describe('SchedulerService Integration Tests', function testSchedulerServiceIT() {
  this.timeout(10000);

  after((done) => {
    clearTestDocument(done);
  });

  describe('startTask', () => {
    beforeEach((done) => {
      createTestDocument(done);
    });

    it('should send an email to the test user, after the task fires.', (done) => {
      const schedulerService = new SchedulerService(factory);
      schedulerService.startTask('testUtilizationVerificationEmail')
        .then(() => {
          _.delay(() => {
            // Check your Email!
            done();
          }, 6000);
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
