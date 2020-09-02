'use strict';


const _ = require('underscore');
const assert = require('assert');
const supertest = require('supertest');


const CategoriesHelper = require('./Categories.helper');
const DatabaseHelper = require('../../Database.helper');
const UserHelper = require('../user/User.helper');


const auth = require('../../../server/routes/auth');
const Model = require('../../../server/models/Model');
const RouteBuilder = require('../../../server/routes/RouteBuilder');
const ServerInitializer = require('../../../server/ServerInitializer');


const route = new RouteBuilder().build();
const serverInitializer = new ServerInitializer(route);
const app = serverInitializer.initialize();


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


const testCategoryName = 'Testus';
let testCategoryDocument = undefined;
function createTestDocumentsBeforeEachTest(done) {
  testCategoryDocument = CategoriesHelper.getTemplate();
  testCategoryDocument.name = testCategoryName;
  DatabaseHelper.createOrUpdate(Model.Databases.CATEGORIES,
    'name',
    testCategoryDocument.name,
    testCategoryDocument)
    .then((document) => {
      testCategoryDocument = document;
      done();
    })
    .catch((error) => {
      done(error);
    });
}


let isDeletingTestCategory = true;
function deleteTestDocumentsAfterEachTest(done) {
  if (isDeletingTestCategory) {
    DatabaseHelper.delete(Model.Databases.CATEGORIES, 'name', testCategoryName)
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  } else {
    done();
  }
}


const baseUrl = '/rest/v1/admin/categories';

describe('Categories Resource Integration Tests', function categoriesResourceIT() {
  this.timeout(2000);

  after(deleteApiUserAfterTest);
  before(createApiUserBeforeTest);


  describe('add', () => {
    afterEach(deleteTestDocumentsAfterEachTest);


    it('Should create the category, and return its location.', (done) => {
      isDeletingTestCategory = true;
      const testDescription = 'description';
      const jsonBody = {
        name: testCategoryName,
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

            DatabaseHelper.findOne(Model.Databases.CATEGORIES, '_id', id)
              .then((document) => {
                assert(document.name, testCategoryName, 'The wrong name was saved.');
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
      isDeletingTestCategory = false;
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
    afterEach(deleteTestDocumentsAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should delete the document, and return status code 204.', (done) => {
      isDeletingTestCategory = true;
      const url = `${baseUrl}/${testCategoryDocument._id}`;
      supertest(app)
        .delete(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 204, 'The wrong status code was sent.');


            DatabaseHelper.findOne(Model.Databases.CATEGORIES, '_id', testCategoryDocument._id)
              .then(() => {
                done('The document was not deleted.');
              })
              .catch(() => {
                isDeletingTestCategory = false;
                done();
              });
          } catch (fail) {
            done(fail);
          }
        });
    });


    it('Should return status 404, if the specified category does not exist.', (done) => {
      isDeletingTestCategory = true;
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


  describe('getCategories', () => {
    it('Should return all of the category documents, with status 200.', (done) => {
      isDeletingTestCategory = true;
      const url = baseUrl;
      supertest(app)
        .get(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 200, 'The wrong status code was sent.');

            DatabaseHelper.findAll(Model.Databases.CATEGORIES)
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


  describe('getCategory', () => {
    afterEach(deleteTestDocumentsAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should return the document, with status 200', (done) => {
      isDeletingTestCategory = true;
      const url = `${baseUrl}/${testCategoryDocument._id}`;
      supertest(app)
        .get(url)
        .set('x-access-token', testApiUserToken.token)
        .send()
        .end((error, response) => {
          try {
            assert(response.status === 200, 'The wrong status code was sent.');

            DatabaseHelper.findOne(Model.Databases.CATEGORIES, '_id', testCategoryDocument._id)
              .then((document) => {
                DatabaseHelper.compareDocuments(document, testCategoryDocument);
                assert(document._id === testCategoryDocument._id,
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
      isDeletingTestCategory = true;
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


  describe('updateCategory', () => {
    afterEach(deleteTestDocumentsAfterEachTest);
    beforeEach(createTestDocumentsBeforeEachTest);


    it('Should update the document, with status 204.', (done) => {
      isDeletingTestCategory = true;
      const testDescription = 'description';
      const jsonBody = {
        description: testDescription,
      };

      const url = `${baseUrl}/${testCategoryDocument._id}`;
      supertest(app)
        .put(url)
        .set('x-access-token', testApiUserToken.token)
        .send(jsonBody)
        .end((error, response) => {
          try {
            assert.equal(response.status, 204, 'The wrong status code was sent.');

            DatabaseHelper.findOne(Model.Databases.CATEGORIES, '_id', testCategoryDocument._id)
              .then((document) => {
                assert.equal(document.name, testCategoryDocument.name,
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
      isDeletingTestCategory = true;
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
