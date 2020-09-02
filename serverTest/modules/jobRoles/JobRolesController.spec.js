'use strict';


const _ = require('underscore');
const assert = require('assert');
const q = require('q');


const config = require('config');
const jwt = require('jwt-simple');
const jwtSecret = require('../../../config/secret.js');


const JobRolesController = require('../../../server/modules/jobRoles/JobRolesController');


const JobRolesHelper = require('./JobRoles.helper');


const MockJobRolesService = require('./MockJobRolesService.helper.js');
const MockRequest = require('../../MockRequest.helper');
const MockResponse = require('../../MockResponse.helper');


const restUrl = config.get('domain.url');
const mockRequest = new MockRequest();
const mockResponse = new MockResponse();


const mockJobRolesService = new MockJobRolesService();
const jobRolesController = new JobRolesController(mockJobRolesService);

function clearRequestBeforeEachTest() {
  mockRequest.clear();

  const token = jwt.encode({
    iss: 'testuser',
  }, jwtSecret());

  mockRequest.headers = {
    'x-access-token': token,
  };
}


describe('JobRolesController', function jobRolesControllerTest() {
  this.timeout(2000);


  describe('add', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should create the JobRole.', (done) => {
      mockRequest.body = {
        name: 'name',
        description: 'description',
      };

      const expectedId = mockJobRolesService.nextId + 1;
      jobRolesController.add(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const response = mockResponse.sentResponse;
            assert(response.location === `${restUrl}/v1/admin/jobroles/${expectedId}`,
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

      jobRolesController.add(mockRequest, mockResponse);
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

      jobRolesController.delete(mockRequest, mockResponse);
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


  describe('getJobRoles', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should return all of the JobRoles', (done) => {
      mockRequest.query = {
        limit: 5,
        offset: 0,
      };

      const firstJobRole = JobRolesHelper.getTemplate();
      firstJobRole.name = 'First';

      const secondJobRole = JobRolesHelper.getTemplate();
      secondJobRole.name = 'Second';

      mockJobRolesService.jobRolesList = [firstJobRole, secondJobRole];
      jobRolesController.getJobRoles(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const expectedJson = {
              items: mockJobRolesService.jobRolesList,
              kind: 'Resource#JobRolesList',
            };

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


  describe('getJobRole', () => {
    beforeEach(clearRequestBeforeEachTest);


    it('Should return the JobRole', (done) => {
      mockRequest.params = {
        categoryId: 5,
      };

      const jobRole = JobRolesHelper.getTemplate();
      jobRole.name = 'novus';
      mockJobRolesService.jobRole = jobRole;

      jobRolesController.getJobRole(mockRequest, mockResponse);
      q.delay(10)
        .then(() => {
          try {
            const expectedJsonResponse = {
              item: jobRole,
              kind: 'Resource#JobRoleDetails',
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

      jobRolesController.updateJobRoles(mockRequest, mockResponse);
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
