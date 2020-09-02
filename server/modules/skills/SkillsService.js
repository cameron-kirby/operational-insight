'use strict';

const _ = require('underscore');
const q = require('q');

class SkillsService {
  constructor(categoriesRepository,
    skillsRepository,
    usersRepository) {
    this._categoriesRepository = categoriesRepository;
    this._skillsRepository = skillsRepository;
    this._usersRepository = usersRepository;
  }


  /*
  * This method is for creating a new skill in the cloudant database.
  *
  * @param {String} name
  *    The name of the skill.
  * @param {String} description
  *    The description of the skill.
  * @param {Number} categoryId
  *    The id of the skill's category.
  * @param {String} creatorUserId
  *    The id of the user who created this skill.
  * @param {Boolean} isTrending
  *    True if the skill is trending.
  *
  * @returns {q.defer}
  *    The promise to add the skill.
  */
  addSkill(name,
    description,
    categoryId,
    creatorUserId,
    isTrending) {
    return this._categoriesRepository.findById(categoryId)
      .then((categoryDoc) => {
        const skillDocDeferred = q.defer();

        // Build the skill document to be inserted
        const skill = {};
        skill.name = name;
        skill.description = description;
        skill.category_id = categoryId;
        skill.category = categoryDoc.name;
        skill.people_count = 0;
        skill.trending = isTrending;
        skill.managers = [];
        skill.created_by = creatorUserId;
        skill.created_date = new Date().getTime();

        skillDocDeferred.resolve(skill);

        // Using a promise here, in order to flatten the promise chain.
        return skillDocDeferred.promise;
      })
      .then(this._skillsRepository.createOrUpdate);
  }


  /*
  * Deletes a particular skill based on the skill ID provided in the request.
  * It also deletes the skill entry in the users database.
  *
  * @param {String} skillId
  *    The id of the skill that will be deleted.
  *
  * @returns {q.defer}
  *    The promise to delete the skill.
  */
  deleteSkill(skillId) {
    const deferred = q.defer();
    let originalSkillDocument;
    let isSkillDeleted = false;

    this._skillsRepository.findById(skillId)
      .then((skillDoc) => {
        const skillsDeferred = q.defer();

        originalSkillDocument = skillDoc;
        skillsDeferred.resolve(skillDoc);

        return skillsDeferred.promise;
      })
      .then(this._skillsRepository.delete)
      .then(this._usersRepository.findBySkill)
      .then((userDocuments) => {
        const usersDeferred = q.defer();

        const usersDocs = [];
        _.each(userDocuments.rows, (user) => {
          const skills = user.doc.skills;
          for (let i = 0; i < skills.length; i++) {
            const skillElement = skills[i];
            if (_.isMatch(skillElement, { id: skillId })) {
              // if skill found in users document remove the skill
              skills.splice(skills.indexOf(skillElement), 1);
              const currentUser = user;
              currentUser.skills = skills;
              break;
            }
          }
          usersDocs.push(user.doc);
        });
        usersDeferred.resolve(usersDocs);
        isSkillDeleted = true;

        return usersDeferred.promise;
      })
      .then(this._usersRepository.updateList)
      .catch((error) => {
        if (originalSkillDocument) {
          if (isSkillDeleted === true) {
            delete originalSkillDocument._rev;
          }
          this._skillsRepository.createOrUpdate(originalSkillDocument)
            .finally(() => {
              const resObj = {};
              resObj.status_code = 500;
              resObj.message = `Could not save the Skill. Error was ${error.errorJSON}`;
              deferred.reject(resObj);
            });
        } else {
          const resObj = {};
          resObj.status_code = 500;
          resObj.message = `Could not save the Skill. Error was ${error.errorJSON}`;
          deferred.reject(resObj);
        }
      })
      .done(() => {
        deferred.resolve();
      });

    return deferred.promise;
  }


 /*
  * This method is for retrieving a particular skill details based
  * on skill ID provided in the request. If the relatedSkills parameter is set to true,
  * it also looks for which are of same category and returns them with the skill.
  *
  * @param {String} skillsId
  *    The id of the skill that will be retrieved.
  * @param {String} manager
  *    The id of the manager whose employees use the skill.
  * @param {Boolean} relatedSkills
  *    True if the related skills are to be retrieved along with this skill. Related
  *    skills are those in the same category, and used by the same manager.
  *
  * @returns {q.defer}
  *    The promise to return the skill.
  */
  getSkill(skillId,
    manager,
    relatedSkills) {
    const deferred = q.defer();

    const skillDoc = {};
    skillDoc.kind = 'Resource#SkillDetails';
    skillDoc.item = {};

    let relatedSkillsCall;
    if (relatedSkills) {
      relatedSkillsCall = this._skillsRepository.findByManagerAndCategory
        .bind(this._skillsRepository, manager);
    } else {
      // Returning an empty promise, since we do not need the releated skills.
      relatedSkillsCall = () => {
        const deferredCall = q.defer();
        deferredCall.resolve({ docs: [] });
        return deferredCall.promise;
      };
    }

    this._skillsRepository.findById(skillId)
      .then((skillDocument) => {
        const skillsDeferred = q.defer();

        skillDoc.item._id = skillDocument._id;
        skillDoc.item.name = skillDocument.name;
        skillDoc.item.description = skillDocument.description;
        skillDoc.item.category_id = skillDocument.category_id;
        skillDoc.item.category = skillDocument.category;
        skillDoc.item.people_count = skillDocument.people_count;
        skillDoc.item.trending = skillDocument.trending;
        skillDoc.item.relatedSkills = [];

        skillsDeferred.resolve(skillDocument.category_id);

        return skillsDeferred.promise;
      })
      .then(relatedSkillsCall)
      .then((relatedSkillsDocuments) => {
        const skills = relatedSkillsDocuments.rows;
        _.each(skills, (skill) => {
          if (skill.doc._id !== skillId && skill.doc.people_count > 0) {
            const relatedSkill = {};
            relatedSkill.skill_id = skill.doc._id;
            relatedSkill.name = skill.doc.name;
            skillDoc.item.relatedSkills.push(relatedSkill); // pushing the skill name
          }
        });

        const resObj = {};
        resObj.status_code = 200;
        resObj.message = skillDoc;
        deferred.resolve(resObj);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not retrieve skill details. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


  /**
   * Gets all of the skills for the specified manager.
   * This variaton is used to populate the list view.
   *
   * @param {String} managerId
   *    The id of the manager, whose skills are being fetched.
   *
   * @returns {q.defer}
   *    The promise to return the list of skills for the list view.
   */
  _getSkillsForListView(managerId) {
    const deferred = q.defer();

    const skillsDoc = {};
    skillsDoc.kind = 'Resource#SkillsList';
    skillsDoc.items = [];

    q.all([
      this._categoriesRepository.findAll(),
      this._skillsRepository.findByManager(managerId),
      this._usersRepository.findSkillCountByCategory(),
    ])
    .spread((categories,
      skillsByManager,
      usersSkillCountByCategory) => {
      const obj = {};

      const categoriesOfManager = _.findWhere(usersSkillCountByCategory.rows, { key: managerId });

      _.each(categoriesOfManager.value, (value, key) => {
        const skills = {};

        _.each(value, (count, id) => {
          if (id !== '_total') {
            const skill = _.findWhere(skillsByManager.rows, { id });

            if (skill) {
              skills[skill.doc._id] = {
                name: skill.doc.name,
                description: skill.doc.description,
                trending: skill.doc.trending,
                count,
              };
            }
          }
        });

        const category = _.findWhere(categories.docs, { _id: key });

        obj[key] = {
          name: category.name,
          description: category.description,
          skills,
          total_count: value._total,
        };
      });

      skillsDoc.items = obj;

      const resObj = {};
      resObj.status_code = 200;
      resObj.message = skillsDoc;
      deferred.resolve(resObj);
    })
    .catch((err) => {
      const resObj = {};
      resObj.status_code = 500;
      resObj.message = err;
      deferred.reject(resObj);
    });

    return deferred.promise;
  }


  /**
   * Determines which database call is needed for the chart.
   *
   * @param {String} managerId
   *    The id of the manager, of the desired skills.
   * @param {String} category
   *    The id of the category, of the desired skills.
   */
  _getSkillDatabaseCallForChart(managerId,
    category) {
    let skillCall;
    if (category === undefined || category === '') {
      if (managerId === 'all') {
        skillCall = this._skillsRepository.findAll.bind(this._skillsRepository);
      } else {
        skillCall = this._skillsRepository.findByManager
          .bind(this._skillsRepository, managerId);
      }
    }

    return skillCall;
  }


  /**
   * Gets the skills required for the chart view.
   *
   * @param {String} managerId
   *    The manager whose employees use the skills.
   * @param {String} category
   *    The category of the skills.
   *
   * @returns {q.defer}
   *    The promise to return the skills.
   */
  _getSkillsForChartView(managerId,
    category) {
    const deferred = q.defer();

    const skillsDoc = {};
    skillsDoc.kind = 'Resource#SkillsList';
    skillsDoc.items = [];

    const skillsCall = this._getSkillDatabaseCallForChart(managerId, category);


    skillsCall()
      .then((skillDocuments) => {
        const categoryObjs = [];
        const items = [];

        if (managerId === 'all') {
          // manager IS 'all', user people_count field as total # of users with the looped skill
          _.each(skillDocuments.rows, (row) => {
            const obj = {
              id: row.doc.category_id,
              name: row.doc.category,
            };

            if (!_.where(categoryObjs, obj).length) {
              categoryObjs.push(obj);
            }

            if (row.doc.people_count > 0) {
              const updatedRow = row;
              updatedRow.doc.skill_in_manager = row.doc.people_count;
              items.push(updatedRow.doc);
            }
          });

          skillsDoc.items = items;
          skillsDoc.categories = categoryObjs;

          const resObj = {};
          resObj.status_code = 200;
          resObj.message = skillsDoc;
          deferred.resolve(resObj);
        } else {
          // Manager is not 'all'. loop through each skill to get
          // sumation of users under the param manager with looped skill
          const findByManagerAndSkillCalls = [];
          _.each(skillDocuments.rows, (row) => {
            findByManagerAndSkillCalls
              .push(this._usersRepository.findByManagerAndSkill(managerId, row.doc._id));
          });

          q.all(findByManagerAndSkillCalls)
            .then((userData) => {
              for (let iUser = 0; iUser < userData.length; ++iUser) {
                const user = userData[iUser];
                const skill = skillDocuments.rows[iUser];
                const obj = {
                  id: skill.doc.category_id,
                  name: skill.doc.category,
                };

                if (!_.where(categoryObjs, obj).length) {
                  categoryObjs.push(obj);
                }

                if (skill.doc.people_count > 0) {
                  const updatedRow = skill;
                  updatedRow.doc.skill_in_manager = user.rows.length;
                  items.push(updatedRow.doc);
                }
              }

              skillsDoc.items = items;
              skillsDoc.categories = categoryObjs;

              const resObj = {};
              resObj.status_code = 200;
              resObj.message = skillsDoc;
              deferred.resolve(resObj);
            })
            .catch((error) => {
              const resObj = {};
              resObj.status_code = 500;
              resObj.message = `Could not retrieve users. Error was ${error}`;
              deferred.resolve(resObj);
            });
        }
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not retrieve users. Error was ${error}`;
        deferred.resolve(resObj);
      });

    return deferred.promise;
  }


  /**
   * Gets the skills needed for the modal search view.
   *
   * @param {String} category
   *    The category of the skills.
   */
  _getSkillsForSearchView(category) {
    const deferred = q.defer();

    const skillsDoc = {};
    skillsDoc.kind = 'Resource#SkillsList';
    skillsDoc.items = [];

    let skillCall;
    if (category) {
      skillCall = this._skillsRepository.findByCategory.bind(this._skillsRepository, category);
    } else {
      skillCall = this._skillsRepository.findAll.bind(this._skillsRepository);
    }

    skillCall()
      .then((documents) => {
        const skillList = [];

        _.each(documents.rows, (row) => {
          skillList.push(row.doc);
        });

        skillsDoc.items = skillList;

        const resObj = {};
        resObj.status_code = 200;
        resObj.message = skillsDoc;
        deferred.resolve(resObj);
      })
      .catch((error) => {
        const resObj = {};
        resObj.status_code = 500;
        resObj.message = `Could not retrieve skills. Error was ${error}`;
        deferred.reject(resObj);
      });

    return deferred.promise;
  }


 /*
  * This method is for retrieving skills in the skills database.
  * If category is specified in the database, then the skills only
  * related to that particular category are retrieved.
  */
  getSkills(manager,
    category,
    view) {
    let promise;
    if (view === 'list') {
      promise = this._getSkillsForListView(manager);
    } else if (view === 'chart') {
      promise = this._getSkillsForChartView(manager, category);
    } else {
      promise = this._getSkillsForSearchView(category);
    }

    return promise;
  }


 /*
  * This method is for updating a particular skill based on the skill ID provided in the request,
  * it also updates the skill in the users database.
  * If only new few attributes of the document are provided in the request body,
  * then those attributes would be updated in the
  *
  * @param {Number} skillId
  *    The id of the skill being updated.
  * @param {String} name
  *    The name of the skill.
  * @param {String} description
  *    The description of the skill.
  * @param {Boolean} isTrending
  *    True if the skill is trending.
  * @param {String} modifierUserId
  *    The id of the user who modified this skill.
  */
  updateSkill(skillId,
    name,
    description,
    isTrending,
    modifierUserId) {
    const deferred = q.defer();

    let originalSkillDocument = undefined;

    this._skillsRepository.findById(skillId)
      .then((skillDoc) => {
        const skillsDeferred = q.defer();

        originalSkillDocument = skillDoc;

        // Create a deep copy of the original document.
        const skill = JSON.parse(JSON.stringify(skillDoc));

        skill.name = name || skillDoc.name;
        skill.description = description || skillDoc.description;
        skill.trending = isTrending || skillDoc.trending;
        skill.modified_by = modifierUserId;
        skill.modified_date = new Date().getTime();

        skillsDeferred.resolve(skill);

        // Using a promise here, in order to flatten the promise chain.
        return skillsDeferred.promise;
      })
      .then(this._skillsRepository.createOrUpdate)
      .then(this._usersRepository.findBySkill)
      .then((userDocuments) => {
        const usersDeferred = q.defer();

        const usersDocs = [];
        _.each(userDocuments.rows, (user) => {
          const skills = user.doc.skills; // skills array
          for (let i = 0; i < skills.length; i++) {
            const skillElement = skills[i];
            if (_.isMatch(skillElement, { id: skillId })) {
              // Create a deep copy of the original document.
              const updatedSkill = JSON.parse(JSON.stringify(skillElement));

              updatedSkill.name = name;

              skills.splice(skills.indexOf(skillElement), 1);
              skills.push(updatedSkill);

              const currentUser = user.doc;
              currentUser.skills = skills;
              break;
            }
          }
          usersDocs.push(user.doc);
        });
        usersDeferred.resolve(usersDocs);

        // Using a promise here, in order to flatten the promise chain.
        return usersDeferred.promise;
      })
      .then(this._usersRepository.updateList)
      .catch(() => {
        // The update failed, re-insert the original skills document.
        this._skillsRepository.createOrUpdate(originalSkillDocument)
          .finally(() => {
            const resObj = {};
            resObj.status_code = 500;
            resObj.message = 'Could not save the Skill';
            deferred.reject(resObj);
          });
      })
      .done(() => {
        const resObj = {};
        resObj.status_code = 204;
        resObj.message = skillId;
        deferred.resolve(resObj);
      });

    return deferred.promise;
  }
}

module.exports = SkillsService;
