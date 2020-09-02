'use strict';


const _ = require('underscore');
const assert = require('assert');


const CategoriesHelper = require('./Categories.helper');
const SkillsHelper = require('../skills/Skills.helper');
const UsersHelper = require('../user/User.helper');


const MockCategoriesRepository = require('./MockCategoriesRepository.helper');
const MockSkillsRepository = require('../skills/MockSkillsRepository.helper');
const MockUserRepository = require('../user/MockUserRepository.helper');


const CategoryService = require('../../../server/modules/categories/CategoriesService');
const DataUtilities = require('../../../server/modules/utils/DataUtilities');


const mockCategoriesRepository = new MockCategoriesRepository();
const mockSkillsRepository = new MockSkillsRepository();
const mockUsersRepository = new MockUserRepository();
const dataUtilities = new DataUtilities();
const categoryService = new CategoryService(mockCategoriesRepository,
  mockSkillsRepository,
  mockUsersRepository,
  dataUtilities);

let testCategoryA = undefined;
let testCategoryB = undefined;
let testSkillA = undefined;
let testSkillB = undefined;
let testUserA = undefined;
let testUserB = undefined;
let testUserC = undefined;
function createTestDataBeforeTest() {
  // Clearing the databases
  mockCategoriesRepository.clearDatabase();
  mockSkillsRepository.clearDatabase();
  mockUsersRepository.clearDatabase();


  // Creating fake test data.
  testCategoryA = CategoriesHelper.getTemplate();
  testCategoryA._id = '1444';
  testCategoryA.name = 'Category A';
  mockCategoriesRepository.testCategoryDatabase[testCategoryA._id] = testCategoryA;

  testCategoryB = CategoriesHelper.getTemplate();
  testCategoryB._id = '1650';
  testCategoryB.name = 'Category B';
  mockCategoriesRepository.testCategoryDatabase[testCategoryB._id] = testCategoryB;


  testSkillA = SkillsHelper.getTemplate();
  testSkillA._id = '42';
  testSkillA.name = 'Skill A';
  testSkillA.category_id = testCategoryA._id;
  testSkillA.category = testCategoryA.name;
  mockSkillsRepository.testSkillDatabase[testSkillA._id] = testSkillA;

  testSkillB = SkillsHelper.getTemplate();
  testSkillB._id = '43';
  testSkillB.name = 'Skill B';
  testSkillB.category_id = testCategoryB._id;
  testSkillB.category = testCategoryB.name;
  mockSkillsRepository.testSkillDatabase[testSkillB._id] = testSkillB;


  testUserA = UsersHelper.getTemplate();
  testUserA._id = 'usera@us.ibm.com';
  testUserA.skills.push(testSkillA);
  testUserA.skills.push(testSkillB);
  mockUsersRepository.testUserDatabase[testUserA._id] = testUserA;

  testUserB = UsersHelper.getTemplate();
  testUserB._id = 'userb@us.ibm.com';
  testUserB.skills.push(testSkillA);
  mockUsersRepository.testUserDatabase[testUserB._id] = testUserB;

  testUserC = UsersHelper.getTemplate();
  testUserC._id = 'userc@us.ibm.com';
  testUserC.skills.push(testSkillB);
  mockUsersRepository.testUserDatabase[testUserC._id] = testUserC;
}


describe('CategoriesService Unit Tests', function categoriesServiceTest() {
  this.timeout(2000);

  describe('add', () => {
    it('Should add the document to the database, and return its id.', (done) => {
      const testDocument = CategoriesHelper.getTemplate();
      categoryService.add(testDocument.name,
        testDocument.description,
        testDocument.created_by)
        .then((id) => {
          try {
            assert(id === mockCategoriesRepository.nextId, 'Read id did not match inserted id.');
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
    beforeEach(createTestDataBeforeTest);


    it('Should delete the document from the database.', (done) => {
      categoryService.delete(testCategoryA._id)
        .then(() => {
          try {
            // We shouldn't find the document in the database.
            const resultDocument = mockCategoriesRepository.testCategoryDatabase[testCategoryA._id];
            assert(!resultDocument, 'The category document was not deleted.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should delete all skills that are of the deleted category.', (done) => {
      categoryService.delete(testCategoryA._id)
        .then(() => {
          try {
            // We shouldn't find the document in the database.
            const skillADocument = mockSkillsRepository.testSkillDatabase[testSkillA._id];
            assert(!skillADocument, 'The skill document was not deleted.');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should not delete any skills that are not of the deleted category.', (done) => {
      categoryService.delete(testCategoryA._id)
        .then(() => {
          try {
            // We shouldn't find the document in the database.
            const skillBDocument = mockSkillsRepository.testSkillDatabase[testSkillB._id];
            assert(skillBDocument, 'The skill document was deleted, and it was not of the deleted'
              + ' category');
            done();
          } catch (error) {
            done(error);
          }
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should delete, from a user\'s document, skills that are of the deleted category.',
      (done) => {
        categoryService.delete(testCategoryA._id)
          .then(() => {
            try {
              // We shouldn't find the document in the database.
              const userADocument = mockUsersRepository.testUserDatabase[testUserA._id];
              const userASkillIds = _.map(userADocument.skills, (skill) => skill._id);
              assert(userASkillIds.indexOf(testSkillA._id) === -1, 'UserA still has the skill that'
                + ' was deleted since its category was deleted.');

              const userBDocument = mockUsersRepository.testUserDatabase[testUserB._id];
              const userBSkillIds = _.map(userBDocument.skills, (skill) => skill._id);
              assert(userBSkillIds.indexOf(testSkillA._id) === -1, 'UserB still has the skill that'
                + ' was deleted since its category was deleted.');
              done();
            } catch (error) {
              done(error);
            }
          })
          .catch((error) => {
            done(error);
          });
      });


    it('Should not delete, from a user\'s document, skills that are not of the deleted category.',
      (done) => {
        categoryService.delete(testCategoryA._id)
          .then(() => {
            try {
              // We shouldn't find the document in the database.
              const userADocument = mockUsersRepository.testUserDatabase[testUserA._id];
              const userASkillIds = _.map(userADocument.skills, (skill) => skill._id);
              assert(userASkillIds.indexOf(testSkillB._id) > -1, 'UserA had SkillB deleted, which'
                + ' was not of the deleted category.');

              const userCDocument = mockUsersRepository.testUserDatabase[testUserC._id];
              const userCSkillIds = _.map(userCDocument.skills, (skill) => skill._id);
              assert(userCSkillIds.indexOf(testSkillB._id) > -1, 'UserC had SkillB deleted, which'
                + ' was not of the deleted category.');
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
    beforeEach(createTestDataBeforeTest);


    it('Should get the category that has the specified id.', (done) => {
      categoryService.getCategory(testCategoryA._id)
        .then((document) => {
          try {
            assert(document._id === testCategoryA._id, 'The incorrect document was returned.');
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


  describe('getCategoryList', () => {
    beforeEach(createTestDataBeforeTest);


    it('Should return all of the category documents.', (done) => {
      categoryService.getCategoriesList()
        .then((documents) => {
          try {
            assert(documents.items.length === 2, 'Both categories were not returned.');
            const missingCategories = [testCategoryA, testCategoryB];

            const readCategory1 = documents.items[0];
            let missingCategoryIndex = missingCategories.indexOf(readCategory1);
            missingCategories.splice(missingCategoryIndex, 1);

            const readCategory2 = documents.items[1];
            missingCategoryIndex = missingCategories.indexOf(readCategory2);
            missingCategories.splice(missingCategoryIndex, 1);
            assert(missingCategories.length === 0, 'At least one category was not returned.');
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
    beforeEach(createTestDataBeforeTest);


    it('Should update the category document.', (done) => {
      const newName = 'look i changed it';
      const newDescription = 'this too!';
      const modifierUserId = testUserC._id;
      categoryService.update(testCategoryA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const categoryDocument = mockCategoriesRepository.testCategoryDatabase[testCategoryA._id];
          assert(categoryDocument.name === newName, 'The name was not updated.');
          assert(categoryDocument.description === newDescription,
           'The description was not updated.');
          assert(categoryDocument.modified_by === modifierUserId,
           'The modified_by field was not updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should update the flattened category name, in skill documents that are '
     + 'of the updated category', (done) => {
      const newName = 'look i changed it';
      const newDescription = 'this too!';
      const modifierUserId = testUserC._id;
      categoryService.update(testCategoryA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const skillADocument = mockSkillsRepository.testSkillDatabase[testSkillA._id];
          assert(skillADocument.category === newName, 'The name was not updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should not update the flattened category name, in skill documents that are not '
     + 'of the updated category', (done) => {
      const originalSkillBCategory = testSkillB.category;
      const newName = 'look i changed it';
      const newDescription = 'this too!';
      const modifierUserId = testUserC._id;
      categoryService.update(testCategoryA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const skillBDocument = mockSkillsRepository.testSkillDatabase[testSkillB._id];
          assert(skillBDocument.category === originalSkillBCategory,
           'The name not supposed to be updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should update the flattened category name, of the skills of the updated category in each '
      + 'user\'s document who had the skill that was updated.', (done) => {
      const newName = 'look i changed it';
      const newDescription = 'this too!';
      const modifierUserId = testUserC._id;
      categoryService.update(testCategoryA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const userADocument = mockUsersRepository.testUserDatabase[testUserA._id];
          assert(userADocument.skills[0].category === newName, 'UserA\'s skill\'s category name was'
            + ' not updated');

          const userBDocument = mockUsersRepository.testUserDatabase[testUserB._id];
          assert(userBDocument.skills[0].category === newName, 'UserB\'s skill\'s category name was'
            + ' not updated');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });


    it('Should not update the flattened category name, of the skills not of the updated category '
      + 'for each user', (done) => {
      const originalSkillBCategory = testSkillB.category;
      const newName = 'look i changed it';
      const newDescription = 'this too!';
      const modifierUserId = testUserC._id;
      categoryService.update(testCategoryA._id,
        newName,
        newDescription,
        modifierUserId)
        .then(() => {
          const userADocument = mockUsersRepository.testUserDatabase[testUserA._id];
          assert(userADocument.skills[1].category === originalSkillBCategory,
           'UserA\'s skill\'s was not supposed to be updated.');

          const userCDocument = mockUsersRepository.testUserDatabase[testUserC._id];
          assert(userCDocument.skills[0].category === originalSkillBCategory,
           'UserC\'s skill\'s was not supposed to be updated.');
          done();
        })
        .catch((error) => {
          done(error);
        });
    });
  });
});
