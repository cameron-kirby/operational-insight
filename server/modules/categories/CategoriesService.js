'use strict';


const _ = require('underscore');
const q = require('q');


/**
 * Service for the skill categories REST resource. This service performs the business logic of any
 * requests made against this resource.
 */
class CategoriesService {
  constructor(categoriesRepository,
    skillsRepository,
    usersRepository,
    dataUtilities) {
    this._categoriesRepository = categoriesRepository;
    this._skillsRepository = skillsRepository;
    this._usersRepository = usersRepository;
    this._dataUtilities = dataUtilities;
  }


  /**
   * Deletes a category from the database.
   *
   * @param {Category} categoryDocument
   *    The category document to be deleted.
   *
   * @returns {Promise}
   *    The promise to delete this document.
   */
  _deleteCategory(categoryDocument) {
    let skillDocs = [];
    const usersDocs = [];

    return q.all([
      this._skillsRepository.findByCategory(categoryDocument._id),
      this._usersRepository.findByCategory(categoryDocument._id),
    ])
    .spread((skillDocuments, userDocuments) => {
      const usersDeferred = q.defer();

      // Flattening the data from the view request.
      skillDocs = this._dataUtilities.flattenViewData(skillDocuments);

      _.each(userDocuments.docs, (user) => {
        const skills = user.skills;

        // Keep a copy of skills in another array
        const skillsCopy = [];
        for (let i = 0; i < skills.length; i++) {
          const skillElement = skills[i];
          if (!_.isMatch(skillElement, { category_id: categoryDocument._id })) {
            // if skill category found in users document remove the skill
            skillsCopy.push(skillElement);
          }
        }

        const currentUser = user;
        currentUser.skills = skillsCopy;
        usersDocs.push(currentUser); // push all the updated users documents to userDocs
      });

      usersDeferred.resolve(categoryDocument);
      return usersDeferred.promise;
    })
    .then(this._categoriesRepository.delete)
    .then(() => {
      const skillsDeferred = q.defer();

      skillsDeferred.resolve(skillDocs);
      return skillsDeferred.promise;
    })
    .then(this._skillsRepository.deleteList)
    .then(() => {
      const userListDeferred = q.defer();

      userListDeferred.resolve(usersDocs);
      return userListDeferred.promise;
    })
    .then(this._usersRepository.updateList);
  }


  /**
   * Updates the flattened data when the name of a category changes.
   *
   * @param {Number} categoryId
   *    The id of the category being updated.
   * @param {String} name
   *    The new name of the category.
   * @param {Boolean} isNameChange
   *    True if the name of the category changed.
   *
   * @returns {Promise}
   *    The promise to update the flattened data, if the category's name was changed.
   */
  _updateCategoryFlattenedData(categoryId,
    name,
    isNameChange) {
    const deferred = q.defer();

    if (isNameChange) {
      this._skillsRepository.findByCategory(categoryId)
        .then((skillDocuments) => {
          const skillDeferred = q.defer();

          const flattenedSkillDocs = this._dataUtilities.flattenViewData(skillDocuments);

          // Update the name of the category in the skill documents.
          _.each(flattenedSkillDocs, (skill) => {
            const currentSkill = skill;
            currentSkill.category = name;
          });

          skillDeferred.resolve(flattenedSkillDocs);
          return skillDeferred.promise;
        })
        .then(this._skillsRepository.updateList)
        .then(() => {
          const skillsDeferred = q.defer();

          skillsDeferred.resolve(categoryId);
          return skillsDeferred.promise;
        })
        .then(this._usersRepository.findByCategory)
        .then((userDocuments) => {
          const usersDeferred = q.defer();

          // Renaming the category in the user documents.
          _.each(userDocuments.docs, (user) => {
            _.each(user.skills, (skill) => {
              if (_.isMatch(skill, { category_id: categoryId })) {
                const currentSkill = skill;
                currentSkill.category = name;
              }
            });
          });

          usersDeferred.resolve(userDocuments.docs);
          return usersDeferred.promise;
        })
        .then(this._usersRepository.updateList)
        .catch((error) => {
          deferred.reject(error);
        })
        .done(() => {
          deferred.resolve();
        });
    } else {
      // The name was not changed, so we do not need to update any flattened data.
      deferred.resolve();
    }

    return deferred.promise;
  }
  /**
   * Adds a new category.
   *
   * @param {String} name
   *    The name of the category.
   * @param {String} description
   *    The description of the category.
   * @param {String} creatorUserId
   *    The id of the creator of this category.
   *
   * @returns {Promise}
   *    The promise to create the category.
   */
  add(name,
    description,
    creatorUserId) {
    const categoryDoc = {
      name,
      description,
      created_by: creatorUserId,
      created_date: new Date().getTime(),
    };

    return this._categoriesRepository.createOrUpdate(categoryDoc);
  }


  /**
   * Deletes a category from the database. This also searches all skills that have that category,
   * and deletes them as well. In addition, skills of this category will be removed from all users.
   *
   * @param {Number} categoryId
   *    The id of the category.
   *
   * @returns {Promise}
   *    The promise to delete the document.
   */
  delete(categoryId) {
    return this._categoriesRepository.findById(categoryId)
      .then((categoryDoc) => {
        const categoryDeferred = q.defer();

        categoryDeferred.resolve(categoryDoc);
        return categoryDeferred.promise;
      })
      .then(this._deleteCategory.bind(this));
  }


  /**
   * Gets a category by its id.
   *
   * @param {Number} categoryId
   *    The id of the category.
   *
   * @returns {Promise}
   *    The promise to return the category.
   */
  getCategory(categoryId) {
    return this._categoriesRepository.findById(categoryId);
  }

  /**
   * Gets the all of the categories.
   *
   * @returns {Promise}
   *    The promise to return all of the categories.
   */
  getCategoriesList() {
    const deferred = q.defer();

    this._categoriesRepository.findAll()
      .then((categoriesDocuments) => {
        const categoriesDoc = {
          items: categoriesDocuments.docs,
          kind: 'Resource#CategoriesList',
        };
        deferred.resolve(categoriesDoc);
      })
      .catch((error) => {
        deferred.reject(error);
      });

    return deferred.promise;
  }


  /**
   * Updates a category in the database.
   *
   * @param {Number} categoryId
   *    The id of the category that will be updated.
   * @param {String} name
   *    The new name of the category.
   * @param {String} description
   *    The new description of the category.
   * @param {String} modifierUserId
   *    The user id of the individual who made this change.
   *
   * @returns {Promise}
   *    The promise to update the category.
   */
  update(categoryId,
    name,
    description,
    modifierUserId) {
    let isNameChange = false;

    return this._categoriesRepository.findById(categoryId)
      .then((categoryDoc) => {
        const categoryDeferred = q.defer();

        // Create a deep copy of the original document.
        const category = JSON.parse(JSON.stringify(categoryDoc));

        category.name = (name || categoryDoc.name);
        category.description = (description || categoryDoc.description);
        category.modified_by = modifierUserId;
        category.modified_date = new Date().getTime(); // modified date

        isNameChange = (categoryDoc.name !== name);

        categoryDeferred.resolve(category);
        return categoryDeferred.promise;
      })
      .then(this._categoriesRepository.createOrUpdate)
      .then(() => this._updateCategoryFlattenedData(categoryId, name, isNameChange));
  }
}

module.exports = CategoriesService;
