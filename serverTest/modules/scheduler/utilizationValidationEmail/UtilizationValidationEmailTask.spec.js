'use strict';

const assert = require('assert');
const q = require('q');
const _ = require('underscore');

const Model = require('../../../../server/models/Model');

const Duration = require('../../../../server/modules/utils/Duration');
const EmailService = require('../../../../server/modules/email/EmailService');
const UtilizationValidationEmailTask = require('../../../../server/modules/scheduler/'
  + 'utilizationValidationEmail/UtilizationValidationEmailTask');
const UtilizationRepository
= require('../../../../server/modules/utilization/UtilizationRepository');
const UtilizationService = require('../../../../server/modules/utilization/UtilizationService');

const databaseHelper = require('../../../Database.helper');
const userHelper = require('../../user/User.helper');
const utilizationHelper = require('../../utilization/Utilization.helper');
let testUser = undefined;

let emailResult = 0;
const fakeEmailService = {
  // We want this method to work exactly like the original.
  readTemplate: new EmailService().readTemplate,
  sendEmail: () => {
    const deferred = q.defer();

    ++emailResult;
    deferred.resolve();

    return deferred.promise;
  },
};

const fakeUtilizationService = {
  /**
   * Fake to only return the test user. Otherwise real users could receive test data.
   */
  findUnverifiedUtilizations: () => {
    const deferred = q.defer();

    _.delay(() => {
      deferred.resolve({
        rows: [{
          value: {
            user_id: testUser,
          },
        }],
      });
    }, 250);

    return deferred.promise;
  },
};

const expireDuration = new Duration();
expireDuration.weeks = 2;

const tokenDuration = new Duration();
tokenDuration.days = 1;

const utilizationRepository = new UtilizationRepository();
const utilizationService = new UtilizationService(utilizationRepository);

describe('UtilizationValidationEmailTask Tests', function testUtilizationValidationEmailTask() {
  this.timeout(120000);
  describe('start', () => {
    let testUtilizationDocument = undefined;
    let testUserDocument = undefined;

    beforeEach((done) => {
      // Create the test user document, token, and utilization document.
      if (!testUserDocument) {
        testUserDocument = userHelper.getTemplate();
      }

      testUser = testUserDocument._id;
      databaseHelper.createOrUpdate(Model.Databases.USERS,
       '_id',
       testUserDocument._id,
       testUserDocument)
        .then((userDocument) => {
          testUserDocument = userDocument;

          if (!testUtilizationDocument) {
            testUtilizationDocument = utilizationHelper.getTemplate();
            testUtilizationDocument.updated_date = new Date(2016, 0, 1).getTime();
          }

          databaseHelper.createOrUpdate(Model.Databases.UTILIZATIONS,
           'user_id',
           testUtilizationDocument.user_id,
           testUtilizationDocument)
            .then((utilizationDocument) => {
              testUtilizationDocument = utilizationDocument;
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should send an email to users whose utilizations are not verified', (done) => {
      emailResult = 0;
      const utilizationValidationEmailTask = new UtilizationValidationEmailTask({
        documentId: 'testUtilizationVerificationEmail',
        emailService: fakeEmailService,
        utilizationService: fakeUtilizationService,
        verifyDuration: expireDuration,
        tokenDuration,
        subject: `${new Date()} Test: UtilizationValidationEmailTaskIT`,
      });
      utilizationValidationEmailTask.start()
        .then(() => {
          try {
            assert.equal(emailResult, 1);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should not send an email to a user who is on the ignore list.', (done) => {
      emailResult = 0;
      // Perform the task once, to get the email count of all users.
      const utilizationValidationEmailTask = new UtilizationValidationEmailTask({
        documentId: 'testUtilizationVerificationEmail',
        emailService: fakeEmailService,
        utilizationService,
        verifyDuration: expireDuration,
        tokenDuration,
        subject: `${new Date()} Test: UtilizationValidationEmailTaskIT`,
      });

      utilizationValidationEmailTask.start()
        .then(() => {
          const fullEmailCount = emailResult;
          emailResult = 0;

          const utilizationValidationEmailTask2 = new UtilizationValidationEmailTask({
            documentId: 'testUtilizationVerificationEmail',
            emailService: fakeEmailService,
            utilizationService,
            verifyDuration: expireDuration,
            tokenDuration,
            subject: `${new Date()} Test: UtilizationValidationEmailTaskIT`,
            blackList: [testUser],
          });

          utilizationValidationEmailTask2.start()
            .then(() => {
              try {
                assert.equal(fullEmailCount - emailResult, 1);
                done();
              } catch (error) {
                done(error);
              }
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should only send emails to those on the white list, if the white list exists'
      + ' and if those users have their utilizations out of date.', (done) => {
      emailResult = 0;
      const utilizationValidationEmailTask = new UtilizationValidationEmailTask({
        documentId: 'testUtilizationVerificationEmail',
        emailService: fakeEmailService,
        utilizationService,
        verifyDuration: expireDuration,
        tokenDuration,
        subject: `${new Date()} Test: UtilizationValidationEmailTaskIT`,
        whiteList: [testUser],
      });
      utilizationValidationEmailTask.start()
        .then(() => {
          try {
            assert.equal(emailResult, 1);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
