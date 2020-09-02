'use strict';


const _ = require('underscore');
const assert = require('assert');
const supertest = require('supertest');
const q = require('q');


const auth = require('../../../server/routes/auth');
const Model = require('../../../server/models/Model');
const RouteBuilder = require('../../../server/routes/RouteBuilder');
const ServerInitializer = require('../../../server/ServerInitializer');


const DatabaseHelper = require('../../Database.helper');
const JobRolesHelper = require('./JobRoles.helper');
const UserHelper = require('../user/User.helper');


let testApiUser;
let testApiUserToken;
function createApiUserBeforeTest(done) {
  testApiUser = UserHelper.getTemplate();
  testApiUser.role = 'Admin';
  DatabaseHelper.createOrUpdate(Model.Databases.USERS,
  '_id',
  testApiUser._id,
  testApiUser)
  .then((userDocument) => {
    testApiUser = userDocument;
    testApiUserToken = auth.genToken(userDocument._id);
    done();
  })
  .catch((error) => {
    done(error);
  });
}


function deleteApiUserAfterTest(done) {
  DatabaseHelper.delete(Model.Databases.USERS, '_id', testApiUser._id)
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
    });
}




const testJobRoleName = 'Testus';
let testJobRoleDocument = undefined;
function createTestDocumentsBeforeEachTest(done) {
  testJobRoleDocument = JobRolesHelper.getTemplate();
  testJobRoleDocument.name = testJobRoleName;
  DatabaseHelper.createOrUpdate(Model.Databases.JOB_ROLES,
    'name',
    testJobRoleDocument.name,
    testJobRoleDocument)
    .then((document) => {
      testJobRoleDocument = document;
      done();
    })
    .catch((error) => {
      done(error);
    });
}


function wait() {
  const deferred = q.defer();

  q.delay(20).then(() => {
    deferred.resolve();
  });

  return deferred.promise;
}


let isDeletingTestJobRole = true;
function deleteTestDocuments() {
  const deferred = q.defer();

  if (isDeletingTestJobRole) {
    DatabaseHelper.delete(Model.Databases.JOB_ROLES, 'name', testJobRoleName)
      .then(() => {
        deferred.resolve();
      })
      .catch((error) => {
        deferred.reject(error);
      });
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}


function deleteTestDocumentsAndWaitAfterEachTest(done) {
  wait().then(deleteTestDocuments).then(() => done())
    .catch((error) => done(error));
}


const baseUrl = '/rest/v1/admin/jobroles';
const route = new RouteBuilder().build();
const serverInitializer = new ServerInitializer(route);
const app = serverInitializer.initialize();


describe('JobRolesResource Integration Tests', function jobRolesResourceIT() {
  this.timeout(5000);

  after(deleteApiUserAfterTest);
  before(createApiUserBeforeTest);


  describe('add', () => {
    afterEach(deleteTestDocumentsAndWaitAfterEachTest);


    it('Should create the JobRole, and return its location.', (done) => {
      isDeletingTestJobRole = true;
      const testDescription = 'description';
      const jsonBody = {
        name: testJobRoleName,
        description: testDescription,
      };

      const url = baseUrl;
      supertest(app)
        .post(url)
        .set('x-access-token', testApiUserToken.token)
        .send(jsonBody)
        .end((error, response) => {
          try {
            assert.equal(response.status, 201, 'The wrong status code was sent.');

            const location = response.headers.location;
            const lastSlash = location.lastIndexOf('/');
            const id = location.substring(lastSlash + 1);

            DatabaseHelper.findOne(Model.Databases.JOB_ROLES, '_id', id)
              .then((document) => {
                assert(document.name, testJobRoleName, 'The wrong name was saved.');
                assert(document.description, testDescription, 'The wrong description was saved.');
                done();
              })
              .catch((innerError) => {
                done(innerError);
              });
          } catch (fail) {
            done(fail);
          }
        });
    });


    it('Should return status code 400, if the name is not specified.', (done) => {
      isDeletingTestJobRole = false;
      const testDescription = 'description';
      const jsonBody = {
        description: testDescription,
      };

      const url = baseUrl;
      supertest(app)
        .post(url)
        .set('x-access-token', testApiUserToken.token)
        .send(jsonBody)
        .end((error, response) => {
          try {
            assert.equal(response.status, 400, 'The wrong status code was sent.');

            const expectedBody = {
              error_code: 400,
              message: 'name attribute is mandatory',
            };

            const actualBody = response.body;
            assert(_.isEqual(expectedBody, actualBody), 'The wrong JSON body was sent.');
            done();
          } catch (fail) {
            done(fail);
          }
        });
    });
  });


  describe('delete', () => {
    afterEach(deleteTestDocumentsAndWaitAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should delete the document, and return status code 204.', (done) => {
      isDeletingTestJobRole = true;
      const url = `${baseUrl}/${testJobRoleDocument._id}`;
      supertest(app)
        .delete(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 204, 'The wrong status code was sent.');


            DatabaseHelper.findOne(Model.Databases.JOB_ROLES, '_id', testJobRoleDocument._id)
              .then(() => {
                done('The document was not deleted.');
              })
              .catch(() => {
                isDeletingTestJobRole = false;
                done();
              });
          } catch (fail) {
            done(fail);
          }
        });
    });


    it('Should return status 404, if the specified JobRole does not exist.', (done) => {
      isDeletingTestJobRole = true;
      const url = `${baseUrl}/NOT_GOING_TO_FIND_ME`;
      supertest(app)
        .delete(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 404, 'The wrong status code was sent.');
            done();
          } catch (fail) {
            done(fail);
          }
        });
    });
  });


  describe('getJobRole', () => {
    afterEach(deleteTestDocumentsAndWaitAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should return the document, with status 200', (done) => {
      isDeletingTestJobRole = true;
      const url = `${baseUrl}/${testJobRoleDocument._id}`;
      supertest(app)
        .get(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 200, 'The wrong status code was sent.');

            DatabaseHelper.findOne(Model.Databases.JOB_ROLES, '_id', testJobRoleDocument._id)
              .then((document) => {
                DatabaseHelper.compareDocuments(document, testJobRoleDocument);
                assert(document._id === testJobRoleDocument._id,
                 'The ids of the documents do not match.');
                done();
              })
              .catch((innerError) => {
                done(innerError);
              });
          } catch (fail) {
            done(fail);
          }
        });
    });


    it('Should return status 404, if the document could not be found.', (done) => {
      isDeletingTestJobRole = true;
      const url = `${baseUrl}/NOT_GOING_TO_FIND_ME`;
      supertest(app)
        .get(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 404, 'The wrong status code was sent.');
            done();
          } catch (fail) {
            done(fail);
          }
        });
    });
  });


  describe('getJobRoleList', () => {
    it('Should return all of the category documents, with status 200.', (done) => {
      isDeletingTestJobRole = true;
      const url = `${baseUrl}?limit=900&offset=0`;
      supertest(app)
        .get(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 200, 'The wrong status code was sent.');

            DatabaseHelper.findAll(Model.Databases.JOB_ROLES)
              .then((documents) => {
                assert(documents.docs.length === response.body.items.length,
                'The wrong number of documents was sent.');
                done();
              })
              .catch((innerError) => {
                done(innerError);
              });
          } catch (fail) {
            done(fail);
          }
        });
    });
  });


  describe('updateJobRoles', () => {
    afterEach(deleteTestDocumentsAndWaitAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should update the document, with status 204.', (done) => {
      isDeletingTestJobRole = true;
      const testDescription = 'description';
      const jsonBody = {
        description: testDescription,
      };

      const url = `${baseUrl}/${testJobRoleDocument._id}`;
      supertest(app)
        .put(url)
        .set('x-access-token', testApiUserToken.token)
        .send(jsonBody)
        .end((error, response) => {
          try {
            assert.equal(response.status, 204, 'The wrong status code was sent.');

            DatabaseHelper.findOne(Model.Databases.JOB_ROLES, '_id', testJobRoleDocument._id)
              .then((document) => {
                assert.equal(document.name, testJobRoleDocument.name,
                 'The wrong name was saved.');
                assert.equal(document.description, testDescription,
                 'The wrong description was saved.');
                done();
              })
              .catch((innerError) => {
                done(innerError);
              });
          } catch (fail) {
            done(fail);
          }
        });
    });


    it('Should return with status 404, if the document could not be found.', (done) => {
      isDeletingTestJobRole = true;
      const testDescription = 'description';
      const jsonBody = {
        description: testDescription,
      };

      const url = `${baseUrl}/NOT_GOING_TO_FIND_ME`;
      supertest(app)
        .put(url)
        .set('x-access-token', testApiUserToken.token)
        .send(jsonBody)
        .end((error, response) => {
          try {
            assert.equal(response.status, 404, 'The wrong status code was sent.');
            done();
          } catch (fail) {
            done(fail);
          }
        });
    });
  });
});
