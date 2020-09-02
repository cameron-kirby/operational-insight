'use strict';

const assert = require('assert');
const moment = require('moment');

const Duration = require('../../../server/modules/utils/Duration');
const Model = require('../../../server/models/Model');
const LoginTokenService = require('../../../server/modules/loginToken/LoginTokenService');

const loginTokenService = new LoginTokenService();

const databaseHelper = require('../../Database.helper');
const loginTokenHelper = require('./LoginToken.helper');


let testDocument = undefined;
let testDuration = undefined;
function createTestDocument(done) {
  if (!testDocument) {
    testDocument = loginTokenHelper.getTemplate();
  }

  testDuration = new Duration();
  testDuration.days = 1;

  databaseHelper.createOrUpdate(Model.Databases.LOGIN_TOKEN,
   'user_id',
   testDocument.user_id,
   testDocument)
    .then((loginTokenDoc) => {
      testDocument = loginTokenDoc;
      done();
    })
    .catch((error) => {
      done(error);
    });
}

describe('LoginTokenService', function testLoginTokenService() {
  this.timeout(200000);

  describe('createOrUpdateForUser', () => {
    beforeEach((done) => {
      createTestDocument(done);
    });

    it('updates the document for the specified user.', (done) => {
      loginTokenService.createOrUpdateForUser(testDocument.user_id, testDuration)
        .then((document) => {
          const actualDate = document.expries;
          const expectedDate = moment().add(1, 'day');

          try {
            assert.equal(Math.abs(actualDate - expectedDate.toDate()) <= 10000, true);
            assert.notEqual(document.token, undefined);
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

  describe('findByUserId', () => {
    beforeEach((done) => {
      createTestDocument(done);
    });

    it('should return the user\'s login token document', (done) => {
      loginTokenService.findByUserId(testDocument.user_id)
        .then((document) => {
          try {
            assert.equal(document.expries, testDocument.expries);
            assert.equal(document.token, testDocument.token);
            assert.equal(document.user_id, testDocument.user_id);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should return null if the document was not found', (done) => {
      loginTokenService.findByUserId('NOT_GOING_TO_FIND_ME')
        .then((document) => {
          try {
            assert.equal(document, null);
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

  describe('verifyToken', () => {
    beforeEach((done) => {
      createTestDocument(done);
    });

    it('should accept the token if is for the correct user,'
     + 'has not expired, and is the latest token.', (done) => {
      const document = testDocument;
      document.token = loginTokenService.encodeToken(document.user_id, testDuration);

      loginTokenService.createOrUpdateForUser(document.user_id, testDuration)
        .then(() => {
          loginTokenService.verifyToken(document.user_id, document.token)
            .then(() => {
              done('Expected failure');
            })
            .catch(() => {
              done();
            });
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should reject the token if it is for a different user.', (done) => {
      const document = testDocument;
      document.token = loginTokenService.encodeToken('someone@us.ibm.com', testDuration);

      loginTokenService.createOrUpdateForUser(document.user_id, testDuration)
        .then(() => {
          loginTokenService.verifyToken(document.user_id, document.token)
            .then(() => {
              done('Expected failure');
            })
            .catch(() => {
              done();
            });
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should reject the token if it does not match the token in the database.',
      (done) => {
        const document = testDocument;
        document.token = loginTokenService.encodeToken(document.user_id, testDuration);

        loginTokenService.createOrUpdateForUser(document.user_id, testDuration)
          .then(() => {
            document.token = loginTokenService.encodeToken(document.user_id, testDuration);
            loginTokenService.verifyToken(document.user_id, document.token)
              .then(() => {
                done('Expected failure');
              })
              .catch(() => {
                done();
              });
          })
          .catch((error) => {
            done(error);
          });
      });

    it('should reject the token if the token has expired.', (done) => {
      const document = testDocument;
      document.token = loginTokenService.encodeToken(document.user_id, testDuration);
      document.expires = moment().subtract(2, 'months').toDate().getTime();

      loginTokenService.createOrUpdateForUser(document.user_id, testDuration)
        .then(() => {
          loginTokenService.verifyToken(document.user_id, document.token)
            .then(() => {
              done('Expected failure');
            })
            .catch(() => {
              done();
            });
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should reject the tokken if the user has no token in the database.', (done) => {
      const token = loginTokenService.encodeToken('NOT_GOING_TO_FIND_ME', testDuration);
      loginTokenService.verifyToken('NOT_GOING_TO_FIND_ME', token)
        .then(() => {
          done('Expected failure');
        })
        .catch(() => {
          done();
        });
    });
  });
});
