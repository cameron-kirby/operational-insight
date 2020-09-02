'use strict';

const assert = require('assert');

const Model = require('../../../server/models/Model');

const databaseHelper = require('../../Database.helper');
const schedulerHelper = require('./Scheduler.helper');

const ScheduledTaskRepository = require('../../../server/modules/'
  + 'scheduler/ScheduledTaskRepository');

const scheduledTaskRepository = new ScheduledTaskRepository();

describe('ScheduledTaskRepository', function testScheduledTaskRepository() {
  this.timeout(10000);

  describe('findById', () => {
    let testDocument = undefined;

    beforeEach((done) => {
      if (!testDocument) {
        testDocument = schedulerHelper.getTemplate();
      }

      databaseHelper.createOrUpdate(Model.Databases.SCHEDULED_TASK,
       '_id',
       testDocument._id,
       testDocument)
        .then((document) => {
          testDocument = document;
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should find a document if it exists.', (done) => {
      scheduledTaskRepository.findById(testDocument._id)
        .then((document) => {
          try {
            assert.equal(document._id, testDocument._id);
            assert.deepEqual(document.parameters, testDocument.parameters);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should reject the promise if the document does not exist.', (done) => {
      scheduledTaskRepository.findById('NOT_GOING_TO_FIND_ME')
        .then((document) => {
          done(document);
        })
        .catch(() => {
          done();
        });
    });
  });

  describe('findEnabled', () => {
    let enabledDocCount = 0;

    beforeEach((done) => {
      Model.queryView(Model.Databases.SCHEDULED_TASK, 'enabled', { key: 'all' })
        .then((scheduledDocs) => {
          enabledDocCount = scheduledDocs.rows.length;
          done();
        })
        .catch((error) => {
          done(error);
        });
    });

    it('should include all enabled docs.', (done) => {
      scheduledTaskRepository.findEnabled()
        .then((docs) => {
          try {
            assert.equal(docs.length, enabledDocCount);
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
