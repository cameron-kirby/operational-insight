'use strict';

const assert = require('assert');
const _ = require('underscore');
const moment = require('moment');
const q = require('q');

const Model = require('../../../server/models/Model');

const databaseHelper = require('../../Database.helper');
const schedulerHelper = require('./Scheduler.helper');

const Duration = require('../../../server/modules/utils/Duration');
const Factory = require('../../../server/modules/utils/Factory');
const factory = new Factory();

const SchedulerService = require('../../../server/modules/scheduler/SchedulerService');

const ScheduledTaskRepository = require('../../../server/modules/'
  + 'scheduler/ScheduledTaskRepository');


let schedulerService;
const testTaskName = 'testUtilizationVerificationEmail';
let result = 0;
const taskDurationInSeconds = 10;
const testDelayInMilliseconds = taskDurationInSeconds * 1000;


/**
 * Calculates how long the delay in a given test case should wait before executing.
 */
function getTestWaitInMilliseconds(taskCompleteCount) {
  return 2000 + (testDelayInMilliseconds * taskCompleteCount);
}

/**
 * Fake task, which will increment result upon completion.
 */
function FakeTask(parameters) {
  const thisTask = this;

  thisTask.start = () => {
    const deferred = q.defer();

    _.delay(() => {
      result += parameters.increment;
      deferred.resolve(testTaskName);
    }, 250);

    return deferred.promise;
  };
}

factory.add(testTaskName, FakeTask);

function createTestDocument() {
  const testDocument = schedulerHelper.getTemplate();
  const duration = new Duration();
  duration.seconds = taskDurationInSeconds;
  testDocument.frequency = duration;

  testDocument.parameters = {
    increment: 10,
  };

  return testDocument;
}

function writeTestDocumentToDB(testDocument) {
  const deferred = q.defer();

  databaseHelper.createOrUpdate(Model.Databases.SCHEDULED_TASK, '_id',
   testDocument._id, testDocument)
    .then(() => {
      deferred.resolve();
    })
    .catch((error) => {
      deferred.reject(error);
    });

  return deferred.promise;
}


function afterEachCall(done) {
  schedulerService.stopAllTasks();

  // Create a new document, to reset the test document.
  const testDocument = schedulerHelper.getTemplate();

  q.delay(testDelayInMilliseconds).then(() => {
    writeTestDocumentToDB(testDocument)
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  })
  .catch((error) => {
    done(error);
  });
}

describe('SchedulerService', function testSchedulerService() {
  this.timeout(60000);


  describe('restartTask', () => {
    afterEach((done) => {
      afterEachCall(done);
    });


    it('should restart the given task.', (done) => {
      result = 0;
      const testDocument = createTestDocument();

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.restartTask(testTaskName);
          _.delay(() => {
            try {
              assert.equal(result, 10);
              done();
            } catch (error) {
              done(error);
            }
          }, getTestWaitInMilliseconds(1));
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  describe('startTask', () => {
    afterEach((done) => {
      afterEachCall(done);
    });


    it('should start a disabled task.', (done) => {
      result = 0;
      const testDocument = createTestDocument();

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.startTask(testTaskName)
            .then(() => {
              _.delay(() => {
                try {
                  assert.equal(result, 10);
                  done();
                } catch (error) {
                  done(error);
                }
              }, getTestWaitInMilliseconds(1));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should ignore the lastExecuted time, when starting a disabled task.', (done) => {
      result = 0;
      const testDocument = createTestDocument();
      const lastExecutedDate = moment();
      lastExecutedDate.subtract(5, 'seconds');
      testDocument.lastExecuted = lastExecutedDate.toDate().toString();

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.startTask(testTaskName)
            .then(() => {
              _.delay(() => {
                try {
                  // The task should only fire one time.
                  // It should not instantly be triggered since it was previously disabled.
                  assert.equal(result, 10);
                  done();
                } catch (error) {
                  done(error);
                }
              }, getTestWaitInMilliseconds(1));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should immediately execute an enabled task, if that tasks\'s lastExecuted time'
      + ' is greater than its frequency.', (done) => {
      result = 0;
      const testDocument = createTestDocument();
      const lastExecutedDate = moment();
      lastExecutedDate.subtract(taskDurationInSeconds + 2, 'seconds');
      testDocument.lastExecuted = lastExecutedDate.toDate().toString();
      testDocument.enable = true;

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.startTask(testTaskName)
            .then(() => {
              _.delay(() => {
                try {
                  // First task instantly executes, and the second one occurs ~10 seconds later.
                  assert.equal(result, 20);
                  done();
                } catch (error) {
                  done(error);
                }
              }, getTestWaitInMilliseconds(1));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should execute an enabled task after the date equal to the'
      + ' task\'s frequency and its duration has elapsed.', (done) => {
      result = 0;
      const testDocument = createTestDocument();
      const lastExecutedDate = moment();
      lastExecutedDate.subtract(taskDurationInSeconds / 2, 'seconds');
      testDocument.lastExecuted = lastExecutedDate.toDate().toString();
      testDocument.enable = true;

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.startTask(testTaskName)
            .then(() => {
              _.delay(() => {
                try {
                  assert.equal(result, 10);
                  done();
                } catch (error) {
                  done(error);
                }
              }, getTestWaitInMilliseconds(1));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });


    it('should update a Scheduled Task\'s lastExecuted time,'
      + 'after executing that task.', (done) => {
      result = 0;
      const testDocument = createTestDocument();

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.startTask(testTaskName)
            .then(() => {
              _.delay(() => {
                schedulerService.stopTask(testTaskName)
                  .then(() => {
                    const finishedTime = new Date();
                    const scheduledTaskRepository = new ScheduledTaskRepository();
                    scheduledTaskRepository.findById(testTaskName)
                      .then((document) => {
                        try {
                          const lastExecutedDate = new Date(document.lastExecuted);
                          assert.equal(Math.abs(finishedTime.getTime()
                            - lastExecutedDate.getTime() <= testDelayInMilliseconds), true);
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
              }, getTestWaitInMilliseconds(1));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => {
          done(error);
        });
    });
  });

  describe('stopTask', () => {
    afterEach((done) => {
      afterEachCall(done);
    });


    it('should stop the task.', (done) => {
      result = 0;
      const testDocument = createTestDocument();

      writeTestDocumentToDB(testDocument)
        .then(() => {
          schedulerService = new SchedulerService(factory);
          schedulerService.restartTask(testTaskName);
          schedulerService.stopTask(testTaskName);

          _.delay(() => {
            try {
              // We expect to see the promise still execute, but the task will not restart.
              assert.equal(result, 10);
              done();
            } catch (error) {
              done(error);
            }
          }, getTestWaitInMilliseconds(1));
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
