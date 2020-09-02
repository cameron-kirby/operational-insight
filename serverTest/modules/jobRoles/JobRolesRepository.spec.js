'use strict';


const assert = require('assert');
const q = require('q');


const JobRolesHelper = require('./JobRoles.helper');
const DatabaseHelper = require('../../Database.helper');


const Model = require('../../../server/models/Model');


const JobRolesRepository = require('../../../server/modules/jobRoles/JobRolesRepository');


const jobRolesRepository = new JobRolesRepository();


const testJobRoleName = 'Testus';
let testDocument = undefined;
function createTestDocument() {
  const deferred = q.defer();

  testDocument = JobRolesHelper.getTemplate();
  DatabaseHelper.createOrUpdate(Model.Databases.JOB_ROLES,
    'name',
    testJobRoleName,
    testDocument)
    .then((document) => {
      testDocument = document;
      deferred.resolve();
    })
    .catch((error) => {
      deferred.reject(error);
    });

  return deferred.promise;
}
function createDocumentBeforeEachTest(done) {
  createTestDocument().then(() => done())
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


function waitAfterEachTest(done) {
  wait().then(() => done());
}

function deleteTestDocument() {
  const deferred = q.defer();

  DatabaseHelper.delete(Model.Databases.JOB_ROLES, 'name', testJobRoleName)
    .then(() => {
      deferred.resolve();
    })
    .catch((error) => {
      deferred.reject(error);
    });

  return deferred.promise;
}

function deleteAndWaitAfterEachTest(done) {
  wait().then(deleteTestDocument).then(() => done())
    .catch((error) => done(error));
}


describe('JobRolesRepository', function jobRolesRepositoryTest() {
  this.timeout(5000);


  describe('createOrUpdate', () => {
    afterEach(deleteAndWaitAfterEachTest);


    it('Should create a new document, if the document does not have a _rev property.', (done) => {
      testDocument = JobRolesHelper.getTemplate();
      jobRolesRepository.createOrUpdate(testDocument)
        .then((id) => {
          DatabaseHelper.findOne(Model.Databases.JOB_ROLES, 'name', testJobRoleName)
            .then((document) => {
              // Compare all of the properties of the document read from the database to that of the
              // template.
              try {
                DatabaseHelper.compareDocuments(testDocument, document);
                assert(id === document._id);
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
    });


    it('Should update a document, if the document has a _rev property.', (done) => {
      testDocument = JobRolesHelper.getTemplate();

      // First insert the document.
      jobRolesRepository.createOrUpdate(testDocument)
        .then(() => {
          // Now update the document, and reinsert it.
          testDocument.description = 'Test Description';
          jobRolesRepository.createOrUpdate(testDocument)
            .then((id) => {
              DatabaseHelper.findOne(Model.Databases.JOB_ROLES, 'name', testJobRoleName)
              .then((document) => {
                // Compare all of the properties of the document read from the database
                // to that of the template.
                try {
                  DatabaseHelper.compareDocuments(testDocument, document);
                  assert(id === document._id);
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
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should throw and error, if a document is saved with an _id, but no _rev', (done) => {
      testDocument = JobRolesHelper.getTemplate();

      // First insert the document.
      jobRolesRepository.createOrUpdate(testDocument)
        .then(() => {
          // Now update the document, and reinsert it.
          testDocument.description = 'Test Description';
          delete testDocument._rev;
          jobRolesRepository.createOrUpdate(testDocument)
            .then(() => {
              done('An error should have been thrown.');
            })
            .catch(() => {
              // We are expecting the promise to fail.
              done();
            });
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('delete', () => {
    beforeEach(createDocumentBeforeEachTest);
    afterEach(waitAfterEachTest);


    it('Should delete a document, if the document has an _id, and a _rev', (done) => {
      jobRolesRepository.delete(testDocument)
        .then(() => {
          // The document should no longer exist.
          DatabaseHelper.findOne(Model.Databases.JOB_ROLES, 'name', testJobRoleName)
            .then(() => {
              done('The document was not deleted.');
            })
            .catch(() => {
              // We are expecting no documents.
              done();
            });
        })
        .catch((error) => {
          done(error);
        });
    });
  });


  describe('findById', () => {
    afterEach(deleteAndWaitAfterEachTest);
    beforeEach(createDocumentBeforeEachTest);


    it('Should return the document, with the specified id', (done) => {
      jobRolesRepository.findById(testDocument._id)
        .then((document) => {
          try {
            DatabaseHelper.compareDocuments(testDocument, document);
            assert(testDocument._id === document._id);
            assert(testDocument._rev === document._rev);
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should return an error, if the document does not exist', (done) => {
      jobRolesRepository.findById('NOT_GOING_TO_FIND_ME')
        .then(() => {
          done('This document should not have existed!');
        })
        .catch(() => {
          done();
        });
    });
  });


  describe('findAll', () => {
    afterEach(deleteAndWaitAfterEachTest);

    it('Should find all of the Job Roles in the database', (done) => {
      // Find all of the jobRoles in the database.
      jobRolesRepository.findAll()
        .then((documents) => {
          const originalDocumentCount = documents.docs.length;
          DatabaseHelper.createOrUpdate(Model.Databases.JOB_ROLES,
            'name',
            testJobRoleName,
            testDocument)
            .then(() => {
              jobRolesRepository.findAll()
                .then((newDocuments) => {
                  try {
                    // We expect to have found one more document than there was before.
                    const newDocumentCount = newDocuments.docs.length;
                    assert(originalDocumentCount + 1 === newDocumentCount);
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
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
