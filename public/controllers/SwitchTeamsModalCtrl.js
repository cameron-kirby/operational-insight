/**
 * Created by Caesar Cavales on 11/12/15.
 * This is the controller for the switch manager modal
 */

ResrcUtilApp.controller('switchTeamsModalCtrl', function ($scope, $rootScope, $modalInstance, mainFactory, $filter, $cookies, globalState, $state) {
    var myManager = $cookies.get('myManager'),
        currentState = globalState.currentView.name;
        currentState = $state.current.name;

    if(myManager === 'all') {
        $scope.isSelectAll = true;
    }
    else {
        $scope.isSelectAll = false;
    }

    mainFactory.getUsersManagers()
        .then(function (data) {
            $scope.peopleManagers = data.items.sort($filter('predicatBy')("fname"));

            checkReportingMgr();
        }, function (reason) {
            console.log("Failed because " + reason);
        });

    function checkReportingMgr() {
        angular.forEach($scope.peopleManagers, function(value, key) {
            if(value._id === myManager) {
                $scope.peopleManagers[key].isManagerSelected = true;
            }
            else {
               $scope.peopleManagers[key].isManagerSelected = false;
            }
        });
    }

    $scope.switchManager = function(idx, mgrID, team) {
        //clear selected managers
        $scope.isSelectAll = false;
        angular.forEach($scope.peopleManagers, function(value, key) {
            $scope.peopleManagers[key].isManagerSelected = false;
        });

        if(!mgrID) {
            mgrID = 'all';
        }

        //select checkbox for selected manager
        if(idx >= 0) {
            $scope.peopleManagers[idx].isManagerSelected = !$scope.peopleManagers[idx].isManagerSelected;
        }
        else {
            $scope.isSelectAll = !$scope.isSelectAll;
        }

        if(mgrID !== myManager) {
            //update myManager cookie
            $cookies.put('myManager', mgrID);
            $cookies.put('myTeam', team);
            $rootScope.$broadcast('changeTeam');

            // DEPRICATED: Please no longer add view specific code in this if block.
            // Instead each view should implement a handler, for the 'changeTeam' event.

            //check current state and refresh corresponding arrays(s) based on selected manager
            if(currentState === "home.projects") {
                $rootScope.$broadcast('initalLoadTree');
            }
            else if(currentState === "home.projectlist") {
                $rootScope.$broadcast('initalLoadProjectList');
            }
            else if(currentState === "home.projects.detail") {
                $rootScope.$broadcast('initalLoadProjectDetail');
            }
            else if(currentState === "home.projects.projectDetail") {
                $rootScope.$broadcast('initalLoadProfProjectDetail');
            }
            else if(currentState === "home.skills.detail") {
                $rootScope.$broadcast('initalLoadSkillDetail');
            }
            else if(currentState === "home.skills.skillDetail") {
                $rootScope.$broadcast('initalLoadProfSkillDetail');
            }
            else if(currentState === "home.people") {
                $rootScope.$broadcast('initalLoadCardView');
            }
            else if(currentState === "home.peoplelist") {
                $rootScope.$broadcast('initalLoadPeopleList');
            }
            else if(currentState === "Settings") {
                console.log("Placeholder reserved for refreshing view: Settings");
            }
            else if(currentState === "PeopleDetail") {
                console.log("Placeholder reserved for refreshing view: PeopleDetail");
            }
            else {
                console.log("Current state of " + currentState + " not recognized(No array was updated for this state).");
            }

            $rootScope.$broadcast('updateVacation');
            $rootScope.$broadcast('clearSearch');

            $modalInstance.dismiss();
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
});
