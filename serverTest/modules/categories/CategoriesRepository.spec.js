'use strict';


const assert = require('assert');


const CategoriesHelper = require('./Categories.helper');
const DatabaseHelper = require('../../Database.helper');


const Model = require('../../../server/models/Model');


const CategoriesRepository = require('../../../server/modules/categories/CategoriesRepository');


const categoriesRepository = new CategoriesRepository();

const testCategoryName = 'Testus';
function afterEachTest(done) {
  DatabaseHelper.delete(Model.Databases.CATEGORIES, 'name', testCategoryName)
    .then(() => {
      done();
    })
    .catch((error) => {
      done(error);
    });
}


let testDocument = undefined;
function createDocumentBeforeTest(done) {
  testDocument = CategoriesHelper.getTemplate();
  DatabaseHelper.createOrUpdate(Model.Databases.CATEGORIES,
    'name',
    testCategoryName,
    testDocument)
    .then((document) => {
      testDocument = document;
      done();
    })
    .catch((error) => {
      done(error);
    });
}

describe('CategoriesRepository Unit Tests', function testCategoriesRepository() {
  this.timeout(2000);


  describe('createOrUpdate', () => {
    afterEach(afterEachTest);


    it('Should create a new document, if the document does not have a _rev property.', (done) => {
      testDocument = CategoriesHelper.getTemplate();
      categoriesRepository.createOrUpdate(testDocument)
        .then((id) => {
          DatabaseHelper.findOne(Model.Databases.CATEGORIES, 'name', testCategoryName)
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
      testDocument = CategoriesHelper.getTemplate();

      // First insert the document.
      categoriesRepository.createOrUpdate(testDocument)
        .then(() => {
          // Now update the document, and reinsert it.
          testDocument.description = 'Test Description';
          categoriesRepository.createOrUpdate(testDocument)
            .then((id) => {
              DatabaseHelper.findOne(Model.Databases.CATEGORIES, 'name', testCategoryName)
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
      testDocument = CategoriesHelper.getTemplate();

      // First insert the document.
      categoriesRepository.createOrUpdate(testDocument)
        .then(() => {
          // Now update the document, and reinsert it.
          testDocument.description = 'Test Description';
          delete testDocument._rev;
          categoriesRepository.createOrUpdate(testDocument)
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
    beforeEach(createDocumentBeforeTest);


    it('Should delete a document, if the document has an _id, and a _rev', (done) => {
      categoriesRepository.delete(testDocument)
        .then(() => {
          // The document should no longer exist.
          DatabaseHelper.findOne(Model.Databases.CATEGORIES, 'name', testCategoryName)
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
    afterEach(afterEachTest);
    beforeEach(createDocumentBeforeTest);


    it('Should return the document, with the specified id', (done) => {
      categoriesRepository.findById(testDocument._id)
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
      categoriesRepository.findById('NOT_GOING_TO_FIND_ME')
        .then(() => {
          done('This document should not have existed!');
        })
        .catch(() => {
          done();
        });
    });
  });


  describe('findAll', () => {
    afterEach(afterEachTest);

    it('Should find all of the categories in the database', (done) => {
      // Find all of the categories in the database.
      categoriesRepository.findAll()
        .then((documents) => {
          const originalDocumentCount = documents.docs.length;
          DatabaseHelper.createOrUpdate(Model.Databases.CATEGORIES,
            'name',
            testCategoryName,
            testDocument)
            .then(() => {
              categoriesRepository.findAll()
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
