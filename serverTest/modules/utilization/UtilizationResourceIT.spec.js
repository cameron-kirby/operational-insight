'use strict';

const assert = require('assert');
const supertest = require('supertest');

const auth = require('../../../server/routes/auth');
const Duration = require('../../../server/modules/utils/Duration');
const LoginTokenService = require('../../../server/modules/loginToken/LoginTokenService');
const Model = require('../../../server/models/Model');
const RouteBuilder = require('../../../server/routes/RouteBuilder');
const ServerInitializer = require('../../../server/ServerInitializer');

const databaseHelper = require('../../Database.helper');
const userHelper = require('../user/User.helper');
const utilizationHelper = require('./Utilization.helper');

const loginTokenService = new LoginTokenService();


const route = new RouteBuilder().build();
const serverInitializer = new ServerInitializer(route);
const app = serverInitializer.initialize();

describe('Utilization Resource Integration Tests', function testUtilizationResourceIT() {
  this.timeout(2000);
  let testUtilizationDocument = undefined;
  let testUserToken = {};
  let testUserDocument = undefined;
  let testDuration = undefined;

  describe('validate', () => {
    beforeEach((done) => {
      // Create the test user document, token, and utilization document.
      if (!testUserDocument) {
        testUserDocument = userHelper.getTemplate();
      }
      databaseHelper.createOrUpdate(Model.Databases.USERS,
       '_id',
       testUserDocument._id,
       testUserDocument)
        .then((userDocument) => {
          testUserDocument = userDocument;
          testDuration = new Duration();
          testDuration.weeks = 1;
          testUserToken = auth.genToken(userDocument._id, testDuration);

          if (!testUtilizationDocument) {
            testUtilizationDocument = utilizationHelper.getTemplate();
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

    it('should return 200 when the validation method succeeded.', (done) => {
      const url = `/rest/v1/users/${testUtilizationDocument.user_id}/validateUtilization`;
      supertest(app)
        .put(url, testUtilizationDocument)
        .set('x-access-token', testUserToken.token)
        .end((error, response) => {
          assert.equal(response.status, 200);
          done();
        });
    });

    it('should return 200 when the validation method succeeded when using login token.', (done) => {
      testDuration = new Duration();
      testDuration.weeks = 1;
      testUserToken = loginTokenService.encodeToken(testUserDocument._id, testDuration);
      const url = `/rest/v1/users/${testUtilizationDocument.user_id}`
        + `/validateUtilization?token=${testUserToken}`;
      supertest(app)
        .put(url, testUtilizationDocument)
        .end((error, response) => {
          assert.equal(response.status, 200);
          done();
        });
    });

    it('should return 401 when the user cannot be found.', (done) => {
      const url = '/rest/v1/users/NOT_GOING_TO_FIND_ME/validateUtilization';
      const invalidToken = auth.genToken('NOT_GOING_TO_FIND_ME');
      supertest(app)
        .put(url, testUtilizationDocument)
        .set('x-access-token', invalidToken.token)
        .end((error, response) => {
          assert.equal(response.status, 401);
          done();
        });
    });

    it('should return 401 when the user submitted the wrong Java Web Token.', (done) => {
      const url = `/rest/v1/users/${testUtilizationDocument.user_id}/validateUtilization`;
      const invalidToken = auth.genToken('NOT_GOING_TO_FIND_ME');
      supertest(app)
        .put(url, testUtilizationDocument)
        .set('x-access-token', invalidToken.token)
        .end((error, response) => {
          assert.equal(response.status, 401);
          done();
        });
    });

    it('should return 404 when the user does not have a utilization', (done) => {
      // Creating a user, who does not have a utilization.
      const noUtilUserDocument = userHelper.getTemplate();
      noUtilUserDocument._id = 'noutiluser@us.ibm.com';
      noUtilUserDocument.fname = 'No Util';
      noUtilUserDocument.lname = 'User';

      databaseHelper.createOrUpdate(Model.Databases.USERS,
       '_id',
       noUtilUserDocument._id,
       noUtilUserDocument)
        .then(() => {
          const noUtilUserToken = auth.genToken(noUtilUserDocument._id);

          const url = `/rest/v1/users/${noUtilUserDocument._id}/validateUtilization`;
          supertest(app)
            .put(url, noUtilUserDocument)
            .set('x-access-token', noUtilUserToken.token)
            .end((error, response) => {
              try {
                assert.equal(response.status, 404);
                done();
              } catch (exception) {
                done(exception);
              }
            });
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
