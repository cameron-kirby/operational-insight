'use strict';

const q = require('q');
const _ = require('underscore');

const Duration = require('../../../../server/modules/utils/Duration');
const EmailService = require('../../../../server/modules/email/EmailService');
const UtilizationValidationEmailTask = require('../../../../server/modules/scheduler/'
  + 'utilizationValidationEmail/UtilizationValidationEmailTask');

const testUser = 'jcarroll@us.ibm.com';

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

describe('UtilizationValidationEmailTask Integration Tests',
  function testUtilizationValidationEmailTaskIT() {
    this.timeout(20000);
    describe('start', () => {
      it('should send an email to users whose utilizations are not verified', (done) => {
        const utilizationValidationEmailTask = new UtilizationValidationEmailTask({
          documentId: 'testUtilizationVerificationEmail',
          emailService: new EmailService(),
          utilizationService: fakeUtilizationService,
          verifyDuration: expireDuration,
          tokenDuration,
          subject: `${new Date()} Test: UtilizationValidationEmailTaskIT`,
        });
        utilizationValidationEmailTask.start()
          .then(() => {
            // Check your email!
            done();
          })
          .catch((error) => {
            done(error);
          });
      });
    });
  });
