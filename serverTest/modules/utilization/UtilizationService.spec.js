'use strict';

const assert = require('assert');
const Model = require('../../../server/models/Model');
const UtilizationRepository = require('../../../server/modules/utilization/UtilizationRepository');
const UtilizationService = require('../../../server/modules/utilization/UtilizationService');

const databaseHelper = require('../../Database.helper');
const utilizationHelper = require('./Utilization.helper');

const utilizationRepository = new UtilizationRepository();
const utilizationService = new UtilizationService(utilizationRepository);

describe('UtilizationService', function testUtilizationService() {
  this.timeout(10000);
  let testUtilizationDocument = undefined;

  describe('validate', () => {
    beforeEach((done) => {
      // Create the test utilization document.
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
    });

    it('should update the user\'s utilization document\'s "updated_date" field', (done) => {
      utilizationService.validate(testUtilizationDocument.user_id)
        .then((utilId) => {
          Model.retrieveDocumentsById(Model.Databases.UTILIZATIONS, [utilId], true)
            .then((document) => {
              const actualDate = document.updated_date;
              const expectedDate = new Date();

              try {
                assert.equal(Math.abs(actualDate - expectedDate) <= 10000, true);
              } catch (error) {
                done(error);
                return;
              }
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

    it('should return a 404 response if the utilization document is not found.', (done) => {
      utilizationService.validate('NOT_GOING_TO_FIND_ME')
        .then(() => {
          done('You should not have found this document.');
        })
        .catch((error) => {
          try {
            assert.equal(error.status_code, 404);
            done();
          } catch (assertError) {
            done(assertError);
          }
        });
    });
  });
});
