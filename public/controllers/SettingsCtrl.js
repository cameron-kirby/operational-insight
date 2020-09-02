/**
 * Created by Caesar Cavales on 09/28/15.
 * Controller for Settings, store view status
 */
(function () {
  'use strict';

  angular
  .module('ResrcUtilApp')
  .controller('SettingsController', SettingsController);

  SettingsController.$inject = [
    '$scope',
    '$filter',
    'mainFactory',
    'globalState',
    '$cookies',
    'ModalFactory',
    '$modal',
    'SKILL_COLORS',
    '$q',
    '$log',
    'AuthenticationFactory',
    '$state',
    '$timeout',
    '$rootScope',
    'TRUE_ADMIN',
    'utilities'
  ];

  function SettingsController(
    $scope,
    $filter,
    mainFactory,
    globalState,
    $cookies,
    ModalFactory,
    $modal,
    SKILL_COLORS,
    $q,
    $log,
    AuthenticationFactory,
    $state,
    $timeout,
    $rootScope,
    TRUE_ADMIN,
    utilities
  ) {
    var vmSettings = this;
    var root = $rootScope;
    var g = globalState;
    var deleteValue = {};
    var processing = false;
    var items = ['initial'];
    var bookmark = '';

    // get initial information for skill, projects, people panel in operational-insight
    var qArray = [
      getCategories(),
      getUsers('User'),
      getManagers()
    ];

    g.currentView.name = 'Settings';
    g.currentView.toggle = 'closed';

    vmSettings.peopleTab = 'User';
    vmSettings.projectsTab = 'status';
    vmSettings.isProcess = vmSettings.isGeo = vmSettings.isRoles = false;
    vmSettings.isViewers = vmSettings.isAdmin = false;
    vmSettings.viewerSelected = false;

    // array of objects to handle multiple opened skill edit sections
    vmSettings.editSkillBufferAll = [];
    vmSettings.editProjectsBufferAll = [];
    vmSettings.settingsPeopleClean = [];
    vmSettings.isAddCategory = false;
    vmSettings.isAddProjects = false;
    vmSettings.isAddPeople = false;
    vmSettings.validateCategory = false;

    vmSettings.addProjAttrs = {};
    vmSettings.validateProjAttr = false;

    vmSettings.personToAdd = [];
    vmSettings.selectPersonSelected = false;
    vmSettings.searchPeople = false;

    if (root.opHistory[root.opHistory.length - 1]) {
      vmSettings.back = root.opHistory[root.opHistory.length - 1].backLabel;
    }

    vmSettings.contactPerson = utilities.getContactPerson();

    root.$on('changeState', function (event, data) {
      if (data) {
        vmSettings.back = data.backLabel;
      }
    });

    vmSettings.isRealAdmin = (TRUE_ADMIN.indexOf($cookies.get('myID')) > -1);

    vmSettings.categoryMenu = [{
      name: 'Add Skill'
    }, {
      name: 'Edit'
    }, {
      name: 'Delete'
    }];

    vmSettings.peopleRoles = [{
      name: 'User'
    }, {
      name: 'Viewer'
    }, {
      name: 'Admin'
    }];

    vmSettings.peopleStatus = [{
      name: 'Active'
    }, {
      name: 'Inactive'
    }];

    $scope.$on('$destroy', function () {
      $scope.setDefaultSizeSettings();
    });

    $scope.$on('settingsDelYes', function () {
      if (deleteValue) {
        if (deleteValue.name === 'category') {
          deleteCategory(deleteValue.id, deleteValue.index);
        } else if (deleteValue.name === 'skill') {
          deleteSkill(deleteValue.id,
            deleteValue.idParent,
            deleteValue.index,
            deleteValue.idParentindex);
        } else if (deleteValue.name === 'projAttrs') {
          deleteProjAttr(deleteValue.id, deleteValue.index);
        } else if (deleteValue.name === 'users') {
          deletePerson(deleteValue.id, deleteValue.index);
        } else {
          $log.warn('deleteValue not recognized');
        }

        deleteValue = {};
      } else {
        $log.warn('Value to be deleted not recognized');
      }
    });

    $scope.$on('settingsDelNo', function () {
      deleteValue = {};
      $log.info('deleteValue cleared');
    });

    // watch the project name
    $scope.$watch('vmSettings.addCategoryName', function () {
      vmSettings.validateCategory = false;

      if (vmSettings.addCategoryName) {
        angular.forEach(vmSettings.editSkillBufferAll, function (category) {
          if (category.name === vmSettings.addCategoryName) {
            vmSettings.validateCategory = true;
          }
        });
      }

      canAddCategory();
    });

    // watch the project name
    $scope.$watch('vmSettings.addProjAttrs.name', function () {
      vmSettings.validateProjAttr = false;

      if (vmSettings.addProjAttrs.name) {
        angular.forEach(vmSettings.editProjectsBufferAll, function (projAttr) {
          if (projAttr.name === vmSettings.addProjAttrs.name) {
            vmSettings.validateProjAttr = true;
          }
        });
      }

      canAddProject();
    });

    // watches search text box for changes and fetches users from users DB that matches with
    // the searched string
    $scope.$watch('vmSettings.peopleFilter', function () {
      if (vmSettings.peopleFilter) {
        searchPeopleSettings(5, vmSettings.peopleTab, vmSettings.peopleFilter)
          .then(function (data) {
            vmSettings.settingsPeople = [];

            angular.forEach(data.items, function (person) {
              vmSettings.settingsPeople.push(person.doc);
            });
            angular.copy(vmSettings.settingsPeople, vmSettings.settingsPeopleClean);
          });
      } else {
        vmSettings.settingsPeople = [];
        getUsers(vmSettings.peopleTab);
        // vmSettings.settingsPeople = vmSettings.settingsPeopleClean;
      }
    });

    // watch the search input
    $scope.$watch('vmSettings.filterPeople', function () {
      var key = angular.lowercase(vmSettings.filterPeople);

      if (vmSettings.filterPeople) {
        searchFaces(key).then(function (data) {
          vmSettings.filteredPeopleRole = data;
        });
      }
    });

    vmSettings.addPerson = addPerson;
    vmSettings.addProjAttr = addProjAttr;
    vmSettings.addSkill = addSkill;
    vmSettings.addSkillCategory = addSkillCategory;
    vmSettings.cancelAddSkill = cancelAddSkill;
    vmSettings.cancelEditCategory = cancelEditCategory;
    vmSettings.cancelEditPerson = cancelEditPerson;
    vmSettings.cancelEditProjAttr = cancelEditProjAttr;
    vmSettings.cancelEditSkill = cancelEditSkill;
    vmSettings.cancelPeople = cancelPeople;
    vmSettings.cancelProjAttr = cancelProjAttr;
    vmSettings.cancelSkillCategory = cancelSkillCategory;
    vmSettings.changeSelectPerson = changeSelectPerson;
    vmSettings.chooseEditRole = chooseEditRole;
    vmSettings.chooseEditStatus = chooseEditStatus;
    vmSettings.chooseRole = chooseRole;
    vmSettings.chooseStatus = chooseStatus;
    vmSettings.clearManagerSearch = clearManagerSearch;
    vmSettings.clearNewManager = clearNewManager;
    vmSettings.clearPeopleFilter = clearPeopleFilter;
    vmSettings.clickSearchPeople = clickSearchPeople;
    vmSettings.deletePersonConfirm = deletePersonConfirm;
    vmSettings.deleteProjAttrConfirm = deleteProjAttrConfirm;
    vmSettings.deleteSkillConfirm = deleteSkillConfirm;
    vmSettings.doOption = doOption;
    vmSettings.editPerson = editPerson;
    vmSettings.editSkill = editSkill;
    vmSettings.expandCategory = expandCategory;
    vmSettings.getUsersScope = getUsersScope;
    vmSettings.loadMore = loadMore;
    vmSettings.openManagerDropdown = openManagerDropdown;
    vmSettings.personDetails = personDetails;
    vmSettings.projectsToggle = projectsToggle;
    vmSettings.saveEditCategory = saveEditCategory;
    vmSettings.saveEditProjAttr = saveEditProjAttr;
    vmSettings.selectManager = selectManager;
    vmSettings.selectNewManager = selectNewManager;
    vmSettings.selectPerson = selectPerson;
    vmSettings.showEditRoles = showEditRoles;
    vmSettings.showEditStatus = showEditStatus;
    vmSettings.showManagerResult = showManagerResult;
    vmSettings.showMenu = showMenu;
    vmSettings.showNewManagers = showNewManagers;
    vmSettings.showRoles = showRoles;
    vmSettings.showSearchResult = showSearchResult;
    vmSettings.showStatus = showStatus;
    vmSettings.toggleAddCategory = toggleAddCategory;
    vmSettings.toggleAddPeople = toggleAddPeople;
    vmSettings.toggleAddProjectAttribute = toggleAddProjectAttribute;
    vmSettings.toggleEditPeople = toggleEditPeople;
    vmSettings.toggleEditProjAttr = toggleEditProjAttr;
    vmSettings.toggleEditSkill = toggleEditSkill;
    vmSettings.toggleisAddSkill = toggleisAddSkill;
    vmSettings.validateNewSkill = validateNewSkill;

    activate();

    /* -------------------------- */

    function activate() {
      $scope.setFullSizeSettings();

      if (vmSettings.isRealAdmin) {
        qArray.push(getStatus());
      }

      $q.all(qArray);
      initPeoplePanel();
      checkSelectedRole();
    }

    // function to add user from blue pages to operational insight DB
    function addPerson() {
      var newPerson = {
        _id: vmSettings.personToAdd.email,
        status: vmSettings.selectStatus,
        role: vmSettings.selectRole,
        reports_to: vmSettings.addSelectedManager
      };

      if (vmSettings.personToAdd) {
        vmSettings.canAddPerson = false;

        mainFactory.addUser(newPerson).then(function () {
          getUsers(vmSettings.peopleTab);
          vmSettings.cancelPeople();
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot add null person');
      }
    }

    // inserts new project information to appropriate attribute
    function addProjAttr(addProjAttrs) {
      var newProjStatus = {
        name: addProjAttrs.name,
        description: addProjAttrs.description
      };
      var insertTo = null;

      if (addProjAttrs) {
        if (vmSettings.projectsTab === 'status') {
          insertTo = 'projectstatus';
        } else if (vmSettings.projectsTab === 'process') {
          insertTo = 'projectprocess';
        } else if (vmSettings.projectsTab === 'geo') {
          insertTo = 'projectgeo';
        } else if (vmSettings.projectsTab === 'role') {
          insertTo = 'jobroles';
        } else {
          $log.warn('Project Tab ' + vmSettings.projectsTab + ' not found');
        }

        if (insertTo) {
          vmSettings.canAddProjectAttr = false;

          mainFactory.addProjectAttribute(insertTo, newProjStatus).then(function () {
            $log.info('Project attribute ' + addProjAttrs.name + ' added to ' + insertTo);
            refreshProjectAttrList();
            vmSettings.cancelProjAttr();
          }, function (reason) {
            $log.error('Failed because ' + reason);
          });
        } else {
          $log.warn('Project Tab ' + vmSettings.projectsTab + ' not found');
        }
      } else {
        $log.warn('Cannot add null attribute');
      }
    }

    // inserts new skill to category
    function addSkill(category, categoryIDX) {
      var newSkill = {
        name: category.addSkillName,
        description: category.addSkillDesc,
        category_id: category._id,
        category: category.name,
        trending: category.addSkillTrending
      };

      if (category) {
        // addSkillValidate
        mainFactory.addSkill(newSkill).then(function () {
          $log.info('Skill ' + category.addSkillName + ' added');
          getSkill(category._id, categoryIDX);

          // clear add skills UI
          clearAddSkill(categoryIDX);
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot add null skill');
      }

      vmSettings.editSkillBufferAll[categoryIDX].addSkillValidate = false;
    }

    // inserts new category to DB
    function addSkillCategory(catName, catDesc) {
      var newSkillCategory = {
        name: catName,
        description: catDesc
      };

      if (catName) {
        vmSettings.canAddCategory = false;

        mainFactory.addCategory(newSkillCategory).then(function () {
          $log.info('Category ' + catName + ' added');
          getCategories();
          vmSettings.cancelSkillCategory();
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot add null category');
      }

      vmSettings.skillCategory = '';
    }

    function cancelAddSkill(idx) {
      clearAddSkill(idx);

      vmSettings.editSkillBufferAll[idx].isAddSkill = false;
      vmSettings.editSkillBufferAll[idx].addSkillValidate = false;
    }

    function cancelEditCategory(categoryParam, categoryIDX) {
      var category = categoryParam;
      $('.edit-category-' + category._id).slideUp(function () {
        category.isEdit = false;
      });

      // reset category name and description to original values
      vmSettings.editSkillBufferAll[categoryIDX].name =
        vmSettings.skillCategories[categoryIDX].name;
      vmSettings.editSkillBufferAll[categoryIDX].description =
        vmSettings.skillCategories[categoryIDX].description;
    }

    // clears editing person input elements and closes editing person section
    function cancelEditPerson(personParam, idx) {
      var person = personParam;

      person.isEditPerson = false;
      person.role = vmSettings.settingsPeopleClean[idx].role;
      person.status = vmSettings.settingsPeopleClean[idx].status;
      person.reports_to = vmSettings.settingsPeopleClean[idx].reports_to;

      delete person.selectedManager;
      delete person.editingManager;
      delete person.message;
    }

    // cancel changed made to edit project attribute
    function cancelEditProjAttr(projAttrsParam, projAttrsIDX) {
      var projAttrs = projAttrsParam;

      vmSettings.editProjectsBufferAll[projAttrsIDX].name =
        vmSettings.projectAttributes[projAttrsIDX].name;
      vmSettings.editProjectsBufferAll[projAttrsIDX].description =
        vmSettings.projectAttributes[projAttrsIDX].description;

      $('#edit-projects-' + projAttrs._id).slideUp(function () {
        projAttrs.isEditProjAttr = false;
      });
    }

    function cancelEditSkill(categoryIDX, idx) {
      angular.copy(vmSettings.skillCategories[categoryIDX].skills[idx],
                   vmSettings.editSkillBufferAll[categoryIDX].skills[idx]);
      vmSettings.editSkillBufferAll[categoryIDX].skills[idx].isEditSkill = false;
    }

    // clears adding person input elements and slides up adding people section
    function cancelPeople() {
      initPeoplePanel();
      vmSettings.selectPersonSelected = false;
      vmSettings.isAddPeople = false;
      vmSettings.addSelectedManager = '';
      vmSettings.viewerSelected = false;

      $('.add-people-section').slideUp();

      // dynamically change css properties when the cancel
      // button is clicked at the time of adding users
      document.getElementById('peopleList').className = 'cancelClass';
    }

    // clears add project attribute section
    function cancelProjAttr() {
      vmSettings.addProjAttrs = '';
      vmSettings.isAddProjects = false;
      $('.add-projects-section').slideUp();
    }

    function cancelSkillCategory() {
      clearAddCategory();
      vmSettings.toggleAddCategory();
    }

    // removing person img when person input element is clicked
    function changeSelectPerson() {
      vmSettings.selectPersonSelected = false;
      vmSettings.canAddPerson = false;
    }

    // assigns new role to edited person
    function chooseEditRole(x, personParam) {
      var person = personParam;
      person.prevRole = person.role;
      person.role = x;

      if (person.reports_to._id) {
        person.validateEdit = true;
      } else {
        person.validateEdit = false;
      }

      // if role is modified to 'Admin', check if modifier is real admin
      if (vmSettings.isRealAdmin === false && x === 'Admin') {
        person.isRealAdminEditValidate = false;
      } else {
        person.isRealAdminEditValidate = true;
      }
    }

    // assigns new status to edited person
    function chooseEditStatus(x, personParam) {
      var person = personParam;
      person.status = x;
      person.isRealAdminEditValidate = true;
      if (vmSettings.isRealAdmin === false && (person.prevRole !== 'Admin' && person.prevRole !== undefined)) {
        person.isRealAdminEditValidate = false;
      }
    }

    // assigns selected role to variable
    function chooseRole(x) {
      vmSettings.selectRole = x;

      if (x === 'Viewer') {
        vmSettings.viewerSelected = true;
        vmSettings.addSelectedManager = '';
        vmSettings.newManagerModel = '';
      } else {
        vmSettings.viewerSelected = false;
      }

      checkSelectedRole();
    }

    // assigns selected status to variable
    function chooseStatus(x) {
      vmSettings.selectStatus = x;
    }

    function clearManagerSearch(personParam, index) {
      var person = personParam;

      person.selectedManager = undefined;
      person.editingManager = true;
      person.reports_to = '';

      $timeout(function () {
        $('.manager-search-' + index).focus();
      });
    }

    function clearNewManager() {
      vmSettings.addSelectedManager = undefined;
      vmSettings.newManagerModel = '';

      $timeout(function () {
        $('.add-manager-search').focus();
      });
    }

    // clears searched people list
    function clearPeopleFilter() {
      vmSettings.filteredPeopleRole = {};
    }

    function clickSearchPeople() {
      vmSettings.searchPeople = !vmSettings.searchPeople;
      vmSettings.peopleFilter = '';

      if (vmSettings.searchPeople) {
        $timeout(function () {
          document.getElementById('search-people-list').focus();
        }, 500);
      } else {
        document.getElementById('search-people-list').blur();
      }
    }

    function deletePersonConfirm(person, idx) {
      setDelValue('users', person._id, idx);
      ModalFactory.settingsConfirmAction('Person');
    }

    function deleteProjAttrConfirm(projAttrID, idx) {
      setDelValue('projAttrs', projAttrID, idx);
      ModalFactory.settingsConfirmAction('Project Attribute');
    }

    function deleteSkillConfirm(x, categoryID, categoryIDX, idx) {
      setDelValue('skill', x, idx, categoryID, categoryIDX);
      ModalFactory.settingsConfirmAction('Skill');
    }

    function doOption(categoryParam, toDo, idx) {
      var category = categoryParam;

      if (category && toDo) {
        if (toDo === 'Add Skill') {
          // if selected category is already expanded, do not run function
          if (!category.isExpand) {
            closeSkillExpands();
          }

          if (!category.skills) {
            getSkill(category._id, idx);
          }

          category.isExpand = true;
          category.isAddSkill = true;

          $('.add-skill-' + category._id).slideDown();
        } else if (toDo === 'Edit') {
          // if selected category is already expanded, do not run function
          if (!category.isExpand) {
            closeSkillExpands();
          }

          category.isExpand = true;
          category.isEdit = true;
          category.isAddSkill = false;
          $('.edit-category-' + category._id).slideDown();
          $('.add-skill-' + category._id).slideDown();
        } else if (toDo === 'Delete') {
          setDelValue('category', category._id, idx);
          ModalFactory.settingsConfirmAction('Category');
        } else {
          $log.warn('Action ' + toDo + ' not found');
        }
      } else {
        $log.warn('Cannot update category. category._id: ' + category._id);
      }
    }

    function editPerson(personParam, idx) {
      var person = personParam;

	    var reportsTo = {};
	    if(person.selectedManager==""){
		    reportsTo=person.reports_to;
	    } else if(person.selectedManager==undefined){
        reportsTo=person.reports_to;
      } else{
		    reportsTo=person.selectedManager;
	    }
	    var editPersonObj = {
		    role: person.role,
		    status: person.status,
		    reports_to: reportsTo
	    };

      if (person) {
        if ((person.role !== vmSettings.settingsPeopleClean[idx].role) ||
            (person.status !== vmSettings.settingsPeopleClean[idx].status) ||
            (person.selectedManager !== vmSettings.settingsPeopleClean[idx].reports_to)) {
          person.validateEdit = false;
          person.isEditPerson = false;

          mainFactory.updateUserDetails(person._id, editPersonObj).then(function () {

	          if (person.status !== vmSettings.settingsPeopleClean[idx].status && person._id == $cookies.get('myID')) {
		          $cookies.remove('myToken');
		          $cookies.remove('myID');
		          $cookies.remove('myName');
		          $cookies.remove('myUserRole');
		          $state.go('login');
	          }

            // remove user from current filter if role is changed
            if (person.role !== vmSettings.settingsPeopleClean[idx].role) {
              vmSettings.settingsPeople.splice(idx, 1);
            }

            // if user changes his role from Admin, redirect to home.projects
            if ((person._id === $cookies.get('myID')) && (person.role !== 'Admin')) {
              vmSettings.person.role = person.role;
              $cookies.put('myUserRole', person.role);
              $state.go('home.projects');
            }

            if (vmSettings.isRealAdmin === false) {
              person.isRealAdminEditValidate = false;
            } else {
              person.isRealAdminEditValidate = true;
            }
          }, function (reason) {
            $log.error('Failed because ' + reason);
          });
        }
      } else {
        $log.warn('Unable to edit. Person not found');
      }
    }

    function editSkill(categoryID, categoryIDX, idx) {
      var updateSkill = {
        id: vmSettings.editSkillBufferAll[categoryIDX].skills[idx]._id,
        name: vmSettings.editSkillBufferAll[categoryIDX].skills[idx].name,
        description: vmSettings.editSkillBufferAll[categoryIDX].skills[idx].description,
        trending: vmSettings.editSkillBufferAll[categoryIDX].skills[idx].trending
      };

      // flip isEdited flag to true. This will disable the button after click
      vmSettings.editSkillBufferAll[categoryIDX].skills[idx].isEdited = true;

      if (vmSettings.editSkillBufferAll[categoryIDX].skills[idx]) {
        mainFactory.updateSkill(updateSkill).then(function () {
          var logString = vmSettings.editSkillBufferAll[categoryIDX].skills[idx].name;
          $log.info('Skill ' + logString + ' updated');
          getSkill(categoryID, categoryIDX);
          vmSettings.editSkillBufferAll[categoryIDX].skills[idx].isEditSkill = false;
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Skill not found');
      }
    }

    function expandCategory(idx, categoryID) {
      if (vmSettings.editSkillBufferAll[idx].isExpand) {
        $('.add-skill-' + categoryID).slideUp(function () {
          vmSettings.editSkillBufferAll[idx].isAddSkill = false;
          vmSettings.editSkillBufferAll[idx].isExpand = false;
        });
      } else {
        closeSkillExpands();
        vmSettings.editSkillBufferAll[idx].isAddSkill = false;
        vmSettings.editSkillBufferAll[idx].isExpand = true;
        $('.add-skill-' + categoryID).slideDown();
      }

      // dynamically change css attributes when '+' button is clicked
      document.getElementById('categoryList').className = 'cancelCat';
    }

    function getUsersScope(role) {
      vmSettings.peopleFilter = '';
      getUsers(role);
    }

    function loadMore(role) {
      if (!processing && items.length > 0) {
        processing = true;

        mainFactory.getUsers(50, bookmark, role, 'all').then(function (data) {
          bookmark = data.pageInfo.bookmark;
          items = data.items;
          // initPersonFields(items);
          vmSettings.people = vmSettings.people.concat(data.items);
          vmSettings.settingsPeople = vmSettings.settingsPeople.concat(data.items);
          angular.copy(vmSettings.settingsPeople, vmSettings.settingsPeopleClean);
          processing = false;
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      }
    }

    function openManagerDropdown(valueParam, index) {
      var value = valueParam;
      var key = angular.lowercase(value.selectedManager.id);

      value.editingManager = true;
      vmSettings.filteredManagers = $filter('filter')(vmSettings.managers, key);

      $('.manager-search-results-' + index).show();
    }

    // initialize person details
    function personDetails(personParam) {
      var person = personParam;

      person.isEditPerson = false;

      if (!person.cname) {
        person.cname = person.fname.concat(' ').concat(person.lname);
      }
    }

    // changes proj attrs list when different tab is selected
    function projectsToggle(projectsTab) {
      vmSettings.projectsTab = projectsTab;

      if (projectsTab === 'status') {
        getStatus();
      } else if (projectsTab === 'process') {
        getProcess();
      } else if (projectsTab === 'geo') {
        getGeo();
      } else if (projectsTab === 'role') {
        getRole();
      }
    }

    function saveEditCategory(categoryParam, categoryIDX) {
      var category = categoryParam;
      var updateCategory = {
        id: category._id,
        name: category.name,
        description: category.description
      };

      if (category) {
        mainFactory.editCategory(updateCategory).then(function () {
          $log.info('Skill ' + category.name + ' updated');

          vmSettings.skillCategories[categoryIDX].name = updateCategory.name;
          vmSettings.skillCategories[categoryIDX].description = updateCategory.description;
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });

        $('.edit-category-' + category._id).slideUp(function () {
          category.isEdit = false;
        });
      } else {
        $log.warn('Cannot add update category');
      }
    }

    function saveEditProjAttr(projAttrsParam, projAttrsIDX) {
      var updateAttr = null;
      var projAttrs = projAttrsParam;
      var editProjStatus = {
        id: projAttrs._id,
        name: projAttrs.name,
        description: projAttrs.description
      };

      if (projAttrs) {
        if (vmSettings.projectsTab === 'status') {
          updateAttr = 'projectstatus';
        } else if (vmSettings.projectsTab === 'process') {
          updateAttr = 'projectprocess';
        } else if (vmSettings.projectsTab === 'geo') {
          updateAttr = 'projectgeo';
        } else if (vmSettings.projectsTab === 'role') {
          updateAttr = 'jobroles';
        } else {
          $log.warn('Project Tab ' + vmSettings.projectsTab + ' not found');
        }

        if (updateAttr) {
          if ((projAttrs.name !== vmSettings.projectAttributes[projAttrsIDX].name) ||
              (projAttrs.description !== vmSettings.projectAttributes[projAttrsIDX].description)) {
            mainFactory.updateProjAttr(updateAttr, editProjStatus).then(function () {
              refreshProjectAttrList();
              $log.info(updateAttr + 'updated');
            }, function (reason) {
              $log.error('Failed because ' + reason);
            });

            $('#edit-projects-' + projAttrs._id).slideUp(function () {
              projAttrs.isEditProjAttr = false;
            });
          } else {
            vmSettings.cancelEditProjAttr(projAttrs, projAttrsIDX);
            $log.warn('Current project status already contains exact value');
          }
        } else {
          $log.warn('Cannot update null attribute');
        }
      }
    }

    function selectManager(personParam, manager, index) {
      var person = personParam;

      person.editingManager = false;
      person.selectedManager = manager;

      $('.manager-search-results-' + index).hide();
    }

    function selectNewManager(manager) {
      vmSettings.addSelectedManager = manager;
      $('.add-manager-search-results').hide();
    }

    // display selected person to person input element
    function selectPerson(x) {
      vmSettings.selectPersonSelected = true;

      if (x.name) {
        vmSettings.filterPeople = x.name;
      } else {
        vmSettings.filterPeople = x.email;
      }

      $('.people-search-result').hide();
      vmSettings.personToAdd = x;

      validateSelectPerson();
    }

    // shows edit role list
    function showEditRoles(personID) {
      $('.role-list-' + personID).show();
    }

    // shows edit status list
    function showEditStatus(personID) {
      $('.status-list-' + personID).show();
    }

    function showManagerResult() {
      $('.manager-search-result').show();
    }

    function showMenu(x) {
      $('.category-menu').hide();
      $('.' + x).show();
    }

    function showNewManagers(value) {
      var key = angular.lowercase(value);
      vmSettings.filteredManagers = $filter('filter')(vmSettings.managers, key);

      $('.add-manager-search-results').show();
    }

    // shows role list
    function showRoles() {
      $('.role-list-add').show();
    }

    // shows searched people list
    function showSearchResult() {
      $('.people-search-result').show();
    }

    // shows status list
    function showStatus() {
      $('.status-list-add').show();
    }

    function toggleAddCategory() {
      if (!vmSettings.isAddCategory) {
        $('.add-category-section').slideDown();
        $('#skills-scroll-area').scrollTop(0);
        // dynamically change css attributes when '+' button is clicked
        document.getElementById('categoryList').className = 'addCat';
      } else {
        // $('.add-category-section').slideUp();
        closeSkillExpands();
        vmSettings.isAddCategory = true;
        // dynamically change css attributes when '+' button is clicked
        document.getElementById('categoryList').className = 'cancelCat';
      }

      vmSettings.isAddCategory = !vmSettings.isAddCategory;
    }

    // toggles add people section
    function toggleAddPeople() {
      if (!vmSettings.isAddPeople) {
        $('.add-people-section').slideDown();
        $('#people-scroll-area').scrollTop(0);
        vmSettings.isAddPeople = true;

        // dynamically change css attributes when '+' button is clicked
        document.getElementById('peopleList').className = 'addClass';
      } else {
        vmSettings.cancelPeople();
      }
    }

    // toggles add project attribute section
    function toggleAddProjectAttribute() {
      if (!vmSettings.isAddProjects) {
        $('.add-projects-section').slideDown();
        $('#projects-scroll-area').scrollTop(0);
        vmSettings.isAddProjects = true;
      } else {
        vmSettings.cancelProjAttr();
      }
    }

    // slides selected project attribute for edit mode
    function toggleEditPeople(personParam) {
      var person = personParam;

      person.isEditPerson = true;
      person.validateEdit = true;
      person.isRealAdminEditValidate = false;
    }

    // slides selected project attribute for edit mode
    function toggleEditProjAttr(projAttrsParam) {
      var projAttrs = projAttrsParam;
      projAttrs.isEditProjAttr = true;
      $('#edit-projects-' + projAttrs._id).slideDown();
    }

    function toggleEditSkill(skill, idx, categoryIDX) {
      closeEditSkillExpands(categoryIDX);
      vmSettings.editSkillBufferAll[categoryIDX].skills[idx].isEditSkill = true;
    }

    function toggleisAddSkill(idx) {
      closeEditSkillExpands(idx);
      vmSettings.editSkillBufferAll[idx].isAddSkill = true;
    }

    // validates to be added skill if both name and description are populated
    function validateNewSkill(categoryIDX) {
      var skillName = vmSettings.editSkillBufferAll[categoryIDX].addSkillName;
      var skillDesc = vmSettings.editSkillBufferAll[categoryIDX].addSkillDesc;

      if ((skillName !== '' && skillName !== undefined) &&
         (skillDesc !== '' && skillDesc !== undefined)) {
        vmSettings.editSkillBufferAll[categoryIDX].addSkillValidate = true;
      } else {
        vmSettings.editSkillBufferAll[categoryIDX].addSkillValidate = false;
      }
    }

    /*  local  */
    function canAddCategory() {
      if (!vmSettings.validateCategory && vmSettings.addCategoryName) {
        vmSettings.canAddCategory = true;
      } else {
        vmSettings.canAddCategory = false;
      }
    }

    // hides/closes all skill panel edit section
    function closeSkillExpands() {
      $('.add-category-section').slideUp();
      vmSettings.isAddCategory = false;

      angular.forEach(vmSettings.editSkillBufferAll, function (categoryVal, key) {
        if (categoryVal.skills) {
          closeEditSkillExpands(key);
        }
        vmSettings.cancelEditCategory(categoryVal, key);

        // if category is expanded, close it
        if (categoryVal.isExpand) {
          vmSettings.expandCategory(key, categoryVal._id);
        }
      });
    }

    function setDelValue(x, y, z, a, b) {
      deleteValue.name = x;
      deleteValue.id = y;
      deleteValue.index = z;
      deleteValue.idParent = a;
      deleteValue.idParentindex = b;
    }

    function closeEditSkillExpands(categoryIDX) {
      vmSettings.editSkillBufferAll[categoryIDX].isAddSkill = false;
      angular.forEach(vmSettings.editSkillBufferAll[categoryIDX].skills,
        function (skillVal, skillIDX) {
          vmSettings.cancelEditSkill(categoryIDX, skillIDX);
        });
    }

    // get a list of skill categories
    function getCategories() {
      vmSettings.skillsLoading = true;
      mainFactory.getCategories().then(function (data) {
        vmSettings.skillCategories = data.items.sort($filter('predicatBy')('name'));
        getSKillCategoryColors();
        getSkills();
        angular.copy(vmSettings.skillCategories, vmSettings.editSkillBufferAll);
      }, function (reason) {
        $log.error('Failed because ' + reason);
      });
    }

    // returns all skills of category ID
    function getSkill(categoryID, categoryIDX) {
      mainFactory.getCategorySkill(categoryID).then(function (data) {
        vmSettings.skillCategories[categoryIDX].skills =
          data.items.sort($filter('predicatBy')('name'));

        if (!vmSettings.editSkillBufferAll[categoryIDX].skills) {
          vmSettings.editSkillBufferAll[categoryIDX].skills = [];
        }

        angular.copy(
          vmSettings.skillCategories[categoryIDX].skills,
          vmSettings.editSkillBufferAll[categoryIDX].skills);
      }, function (reason) {
        $log.error('Failed because ' + reason);
      });
    }

    function getSkills() {
      vmSettings.skillsLoading = false;
      angular.forEach(vmSettings.skillCategories, function (value, key) {
        getSkill(value._id, key);
      });
    }

    function getSKillCategoryColors() {
      vmSettings.skillCategories.forEach(function (elem) {
        // assign skill colors
        if (elem.name) {
          if (!g.categoryColorMapping[elem.name]) {
            g.categoryColorMapping[elem.name] = getRandomColors();
          }
        }
      });

      vmSettings.categoryColorMapping = g.categoryColorMapping;
    }

    function getRandomColors() {
      return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }

    function clearAddCategory() {
      vmSettings.addCategoryName = '';
      vmSettings.categoryDesc = '';
    }

    function deleteCategory(categoryID, idx) {
      if (categoryID) {
        vmSettings.editSkillBufferAll[idx].category_delete = true;
        mainFactory.deleteCategory(categoryID).then(function () {
          $log.info('Category ' + categoryID + ' deleted');

          vmSettings.skillCategories.splice(idx, 1);
          vmSettings.editSkillBufferAll.splice(idx, 1);
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot delete category with blank _id');
      }
    }

    function clearAddSkill(idx) {
      vmSettings.editSkillBufferAll[idx].addSkillName = '';
      vmSettings.editSkillBufferAll[idx].addSkillDesc = '';
      vmSettings.editSkillBufferAll[idx].addSkillTrending = false;
    }

    function deleteSkill(x, categoryID, skillIDX, categoryIDX) {
      if (x) {
        vmSettings.editSkillBufferAll[categoryIDX].skills[skillIDX].skill_delete = true;
        mainFactory.deleteSkill(x).then(function () {
          $log.info('Skill ' + x + ' deleted');
          // getSkill(categoryID, skillIDX);
          vmSettings.editSkillBufferAll[categoryIDX].skills.splice(skillIDX, 1);
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot delete skill with blank _id');
      }
    }

    function canAddProject() {
      if (!vmSettings.validateProjAttr && vmSettings.addProjAttrs.name) {
        vmSettings.canAddProjectAttr = true;
      } else {
        vmSettings.canAddProjectAttr = false;
      }
    }

    // fetches project status
    function getStatus() {
      vmSettings.projectsLoading = true;
      mainFactory.getStatus().then(function (data) {
        vmSettings.projectAttributes = data.items.sort($filter('predicatBy')('name'));
        // buffer copy array of retrieved attributes
        angular.copy(vmSettings.projectAttributes, vmSettings.editProjectsBufferAll);
        vmSettings.projectsLoading = false;
      }, function (reason) {
        $log.error('Failed because ' + reason);
        vmSettings.projectsLoading = false;
      });
    }

    // fetches project process
    function getProcess() {
      vmSettings.projectsLoading = true;
      mainFactory.getProcess().then(function (data) {
        vmSettings.projectAttributes = data.items.sort($filter('predicatBy')('name'));
        // buffer copy array of retrieved attributes
        angular.copy(vmSettings.projectAttributes, vmSettings.editProjectsBufferAll);
        vmSettings.projectsLoading = false;
      }, function (reason) {
        $log.error('Failed because ' + reason);
        vmSettings.projectsLoading = false;
      });
    }

    // fetches project geo
    function getGeo() {
      vmSettings.projectsLoading = true;
      mainFactory.getGeo().then(function (data) {
        vmSettings.projectAttributes = data.items.sort($filter('predicatBy')('name'));
        // buffer copy array of retrieved attributes
        angular.copy(vmSettings.projectAttributes, vmSettings.editProjectsBufferAll);
        vmSettings.projectsLoading = false;
      }, function (reason) {
        $log.error('Failed because ' + reason);
        vmSettings.projectsLoading = false;
      });
    }

    // fetches project role
    function getRole() {
      vmSettings.projectsLoading = true;
      mainFactory.getRole().then(function (data) {
        vmSettings.projectAttributes = data.items.sort($filter('predicatBy')('name'));
        // buffer copy array of retrieved attributes
        angular.copy(vmSettings.projectAttributes, vmSettings.editProjectsBufferAll);
        vmSettings.projectsLoading = false;
      }, function (reason) {
        $log.error('Failed because ' + reason);
        vmSettings.projectsLoading = false;
      });
    }

    function getManagers() {
      mainFactory.getManagers().then(function (data) {
        vmSettings.managers = data.items;
      }, function (reason) {
        $log.error('Failed because ' + reason);
      });
    }

    // refreshes project attribute list on the UI
    function refreshProjectAttrList() {
      if (vmSettings.projectsTab === 'status') {
        getStatus();
      } else if (vmSettings.projectsTab === 'process') {
        getProcess();
      } else if (vmSettings.projectsTab === 'geo') {
        getGeo();
      } else if (vmSettings.projectsTab === 'role') {
        getRole();
      } else {
        $log.warn('Project Tab ' + vmSettings.projectsTab + ' not found');
      }
    }

    // delete selected project attribute
    function deleteProjAttr(x, idx) {
      var deleteFrom = null;

      if (x) {
        if (vmSettings.projectsTab === 'status') {
          deleteFrom = 'projectstatus';
        } else if (vmSettings.projectsTab === 'process') {
          deleteFrom = 'projectprocess';
        } else if (vmSettings.projectsTab === 'geo') {
          deleteFrom = 'projectgeo';
        } else if (vmSettings.projectsTab === 'role') {
          deleteFrom = 'jobroles';
        } else {
          $log.warn('Project Tab ' + x + ' not found');
        }

        if (deleteFrom) {
          vmSettings.editProjectsBufferAll[idx].projAttrs_delete = true;
          mainFactory.deleteProjectAttribute(x, deleteFrom).then(function () {
            $log.info('Project attribute ' + x + ' deleted from ' + deleteFrom);
            refreshProjectAttrList();
          }, function (reason) {
            $log.error('Failed because ' + reason);
          });
        } else {
          $log.warn('Project Tab ' + x + ' not found');
        }
      } else {
        $log.warn('Cannot delete null attribute');
      }
    }

    // initialize elements for adding a person
    function initPeoplePanel() {
      vmSettings.selectPersonSelected = false;
      vmSettings.validatePerson = undefined;
      vmSettings.canAddPerson = false;

      vmSettings.filterPeople = '';
      vmSettings.selectRole = 'User';
      vmSettings.selectStatus = 'Active';
      vmSettings.newManagerModel = '';
    }

    // retrieves people list from USERS DB
    function searchPeopleSettings(limit, role, searchValue) {
      var d = $q.defer();

      mainFactory.searchUsers(5, role, searchValue).then(function (data) {
        d.resolve(data);
      }, function (reason) {
        $log.error('Failed because ' + reason);
        d.reject(reason);
      });

      return d.promise;
    }

    function checkSelectedRole() {
      if (vmSettings.isRealAdmin === false && vmSettings.selectRole === 'Admin') {
        vmSettings.isRealAdminValidate = false;
      } else {
        vmSettings.isRealAdminValidate = true;
      }
    }

    // retrieves people data from bluemix
    function searchFaces(q) {
      var d = $q.defer();

      mainFactory.searchFaces(q).then(function (data) {
        d.resolve(data);
      }, function (reason) {
        $log.error('Failed because ' + reason);
        d.reject(reason);
      });

      return d.promise;
    }

    // get a list of the users
    function getUsers(role) {
      vmSettings.peopleTab = role;

      bookmark = '';
      items = ['initial'];

      // disable delete on Admin tab if user !isRealAdmin
      if (role === 'Admin' && !vmSettings.isRealAdmin) {
        vmSettings.allowDelete = false;
      } else {
        vmSettings.allowDelete = true;
      }

      vmSettings.peopleLoading = true;

      mainFactory.getUsers(50, bookmark, role, 'all').then(function (data) {
        bookmark = data.pageInfo.bookmark;
        vmSettings.people = data.items;
        //initPersonFields(data.items);
        vmSettings.settingsPeople = data.items;
        angular.copy(vmSettings.settingsPeople, vmSettings.settingsPeopleClean);
        vmSettings.peopleLoading = false;
      }, function (reason) {
        $log.error('Failed because ' + reason);
        vmSettings.peopleLoading = false;
      });
    }

    function initPersonFields(people) {
      angular.forEach(people, function (value) {
        var person = value;

        person.isRealAdminEditValidate = true;
      });
    }

    // validates selected person if already in operational-insight
    function validateSelectPerson() {
      if (vmSettings.personToAdd) {
        validateUser(vmSettings.personToAdd.email).then(function (data) {
          if (data === true) {
            vmSettings.validatePerson = false;
            vmSettings.canAddPerson = false;
          } else {
            vmSettings.validatePerson = true;
            vmSettings.canAddPerson = true;
          }
        });
      } else {
        $log.warn('There is no person to add selected');
      }
    }

    // validate user if s/he exist in the user table
    function validateUser(userID) {
      var d = $q.defer();

      mainFactory.validateUserExist(userID).then(function (data) {
        d.resolve(data);
      }, function (reason) {
        $log.error('Failed because ' + reason);
        d.reject(reason);
      });

      return d.promise;
    }

    // delete user from operational-insight DB as well as
    // remove that same person from settingsPeople array
    function deletePerson(personID, idx) {
      if (personID) {
        vmSettings.settingsPeople[idx].person_delete = true;
        mainFactory.deleteUser(personID).then(function () {
          $log.info('User ' + personID + ' deleted');
          vmSettings.settingsPeople[idx].person_delete = true;
          vmSettings.settingsPeople.splice(idx, 1);
        }, function (reason) {
          $log.error('Failed because ' + reason);
        });
      } else {
        $log.warn('Cannot delete user with blank _id');
      }
    }
  }
}());
