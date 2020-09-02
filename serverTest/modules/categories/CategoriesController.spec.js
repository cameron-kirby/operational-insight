'use strict';


const _ = require('underscore');
const assert = require('assert');
const q = require('q');


const CategoriesHelper = require('./Categories.helper');


const MockCategoriesService = require('./MockCategoriesService.helper');
const MockRequest = require('../../MockRequest.helper');
const MockResponse = require('../../MockResponse.helper');


const config = require('config');
const jwt = require('jwt-simple');
const jwtSecret = require('../../../config/secret.js');


const restUrl = config.get('domain.url');
const CategoriesController = require('../../../server/modules/categories/CategoriesController');


const mockCategoriesService = new MockCategoriesService();
const categoriesController = new CategoriesController(mockCategoriesService);

const mockRequest = new MockRequest();
const mockResponse = new MockResponse();


function clearRequestBeforeEachTest() {
  mockRequest.clear();

  const token = jwt.encode({
    iss: 'testuser',
  }, jwtSecret());

  mockRequest.headers = {
    'x-access-token': token,
  };
}


describe('CategoriesController', function categoriesControllerTest() {
  this.timeout(2000);


  describe('add', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should create the category.', (done) => {
      mockRequest.body = {
        name: 'name',
        description: 'description',
      };

      const expectedId = mockCategoriesService.nextId + 1;
      categoriesController.add(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const response = mockResponse.sentResponse;
            assert(response.location === `${restUrl}/v1/admin/categories/${expectedId}`,
            'The location header was not correct.');
            assert(response.status === 201, 'The status code was not correct');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should return 400, if the name parameter is not present.', (done) => {
      mockRequest.body = {
        description: 'description',
      };

      categoriesController.add(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const expectedJson = {
              error_code: 400,
              message: 'name attribute is mandatory',
            };
            const response = mockResponse.sentResponse;
            assert(response.status === 400, 'The status code was not correct');
            assert(_.isEqual(response.json, expectedJson), 'The json body was incorrect');
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


  describe('delete', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should delete the document.', (done) => {
      mockRequest.params = {
        categoryId: 5,
      };

      categoriesController.delete(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const response = mockResponse.sentResponse;
            assert(response.status === 204, 'The wrong status code was sent.');
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


  describe('getCategories', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should return all of the categories', (done) => {
      const firstCategory = CategoriesHelper.getTemplate();
      firstCategory.name = 'First';

      const secondCategory = CategoriesHelper.getTemplate();
      secondCategory.name = 'Second';

      mockCategoriesService.categoriesList = [firstCategory, secondCategory];
      categoriesController.getCategories(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const expectedJson = mockCategoriesService.categoriesList;
            const response = mockResponse.sentResponse;
            assert(response.status === 200, 'The wrong status code was sent.');
            assert(_.isEqual(response.json, expectedJson), 'The wrong json body was sent.');
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


  describe('getCategory', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should return the category', (done) => {
      mockRequest.params = {
        categoryId: 5,
      };

      const category = CategoriesHelper.getTemplate();
      category.name = 'novus';
      mockCategoriesService.category = category;

      categoriesController.getCategory(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const expectedJsonResponse = {
              item: category,
              kind: 'Resource#CategoryDetails',
            };
            const response = mockResponse.sentResponse;
            assert(response.status === 200, 'The wrong status was sent.');
            assert(_.isEqual(response.json, expectedJsonResponse), 'The wrong json body was sent.');
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


  describe('update', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should update the category document.', (done) => {
      mockRequest.body = {
        description: 'description',
        name: 'name',
      };
      mockRequest.params = {
        categoryId: '4',
      };

      categoriesController.updateCategory(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const response = mockResponse.sentResponse;
            assert(response.status === 204, 'The wrong status was sent');
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
