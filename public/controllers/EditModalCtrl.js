/**
 * Created by Xunrong Li on 8/12/15.
 * The Controller for Modal, for know different tab, getting skills/details from Profile Controller
 * Updating skills/details/projects calling factory
 */

ResrcUtilApp.controller('ModalController', function ($scope, mainFactory, $modalInstance, $timeout, $q,
                                                     $state, $stateParams, $rootScope, globalState, SKILL_COLORS, preselectService,$cookies) {
    //handle the situation when click edit button on the profile page
    $timeout(function () {
        $scope.tab = $stateParams.edit;
    });

    //handle the situation when go the url directly(refresh)
    $scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
        if (toState.name == 'home.people.profile.edit.tab') {
            $scope.tab = toParams.edit;
        }
    });

    //TODO: might need to change logic. Watch function consistently returns something
    $scope.$watch(function () {
        return globalState.profileDataLoaded;
    }, function () {
        if (globalState.profileDataLoaded === true) {
            $scope.dataLoaded = true;
            if ($scope.tab == "Skills") {
                getSkills();
            }
        }
    });

    //get skills from profile scope and setting colors
    function getSkills() {
        // Shallow copy
        if (globalState.userProfile.hasOwnProperty('skills')) {
            $scope.ownedSkills = globalState.userProfile.skills.slice();
            $scope.ownedSkills.forEach(function (elem, index, array) {
                if (elem.category_id) {
                    //assign colors to skill if it does not have one
                    if (!globalState.skillColorMapping[elem.category_id]) {
                        globalState.skillColorMapping[elem.category_id] = getRandomColors();
                    }
                }
            });
            $scope.colorMapping = globalState.skillColorMapping;
        }
        else {
            $scope.ownedSkills = [];
            console.log('ModalController getSkills: ' + globalState.userProfile._id + ' does not currently have skills.');
        }
    }

    // update skills for profile pages and backend
    function updateSkills() {
        var ownedSkills = globalState.ownedSkills;

        for (var i = 0; i < ownedSkills.length; i++) {
            //if proficiency updated, insert the new proficiency to the beginning of the proficiency array
            if (JSON.stringify(ownedSkills[i].currentProficiency) !== JSON.stringify(ownedSkills[i].proficiency[0])) {
                globalState.ownedSkills[i].proficiency.unshift(ownedSkills[i].currentProficiency);
            }
            //remove the current Proficiency field so that it keep the same with the db model
            delete globalState.ownedSkills[i].currentProficiency;
        }

        //update skills data for profile page
        globalState.userProfile.skills = globalState.ownedSkills;
        mainFactory.updateUserSkills(globalState.userProfile._id, globalState.userProfile.skills);
        console.log('Updated user profile skills');
    }

    //update details for profile pages and backend
    function updateDetails() {
        mainFactory.updateUserDetails(globalState.userProfile._id, globalState.userProfile).then(function () {
          // Todo: Remove this delay, once the backend for user's has been
          // refactored. This is only necessary because the user resource is
          // sending a response before its update is completed.
          $timeout(function () {
            $rootScope.$broadcast('updateUserVacation');
          }, 10);
        });
    }

    function updateProjects() {
        if (globalState.tmpPerson !== undefined) {
            globalState.userProfile.projects = globalState.tmpPerson;
            mainFactory.updateUserDetails(globalState.userProfile._id, globalState.userProfile).then(function() {
                $rootScope.$broadcast('redrawChart');
            });
        }
        else {
            console.log('No projects to update');
        }
    }

    function addProject() {
        console.log("add");
    }

    //close and return value
    $scope.save = function () {
        globalState.validation = true;

        if ($scope.tab == "Skills") {
            $q.all([
                $rootScope.$broadcast("editUserSkill")
            ]).then(function() {
                if (globalState.validation === true) {
                    updateSkills();
                }
                else {
                    console.log("editUserSkill failed validation");
                }
            });
        } else if ($scope.tab == "Details") {
            $q.all([
                $rootScope.$broadcast("editUserVacation")
            ]).then(function() {
                if (globalState.validation === true) {
                    updateDetails();
                }
                else {
                    console.log("editUserVacation failed validation");
                }
            });
        } else if ($scope.tab == "Projects") {
            $q.all([
                $rootScope.$broadcast("editUserProject")
            ]).then(function() {
                if (globalState.validation === true) {
                    updateProjects();
                }
                else {
                    console.log("editUserProject failed validation");
                }
            });
        }

        $rootScope.$broadcast('updateUser', globalState.userProfile);

        if (globalState.validation === true) {
            $modalInstance.close(true);
            preselectService.clearService();
        }
    };

    $scope.cancel = function () {
        $rootScope.$broadcast('cancelModal');
        preselectService.clearService();
        $modalInstance.dismiss();
    };

    $scope.$on('closeModal', function () {
        //close the modal and redirect the user to login page
        $modalInstance.dismiss();
        $cookies.remove('myToken');
        $cookies.remove('myID');
        $cookies.remove('myName');
        $cookies.remove('myUserRole');
        $state.go('login');
    });

    function getRandomColors() {
        return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }
});
