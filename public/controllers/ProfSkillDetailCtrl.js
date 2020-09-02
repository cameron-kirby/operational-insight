/**
 * Created by Caesar Cavales on 1/25/16.
 * Controller for skill details accessed from profile view
 */
ResrcUtilApp.controller('ProfileSkillDetailController', function ($scope, $rootScope, mainFactory, globalState, $stateParams, $state, $cookies, utilities) {
    globalState.currentView.name = "SkillDetail";
    globalState.fromProfile = true;

    $scope.$on('initalLoadProfSkillDetail', function () {
        $stateParams.manager = $cookies.get("myManager");
        $state.go('home.skills.skillDetail', {manager: $stateParams.manager, skillID: $stateParams.skillID}, {notify: false});
        getAllSkillDetails($stateParams.skillID);
    });

    var poppedState = $rootScope.opHistory.pop();
    if (poppedState !== undefined) {
        if (!((poppedState.name === $state.current.name) && (poppedState.params.filter === $stateParams.filter) && poppedState.params.projectID === $stateParams.projectID)) {
            $rootScope.opHistory.push(poppedState);
        }
    }

    $scope.$on("$destroy", function () {
        globalState.fromProfile = false;
        $rootScope.$broadcast('defaultSkillFromProfile');
    });

    $rootScope.$broadcast('defaultSkillFromProfile');

    function getAllSkillDetails(skillID) {
        var manager = utilities.syncManager($stateParams.manager);

        mainFactory.getSkillDetails(skillID, manager)
            .then(function (data) {
                $scope.skill = data.item;
                $rootScope.currentSkill = $scope.skill.name;

                //use url to go to the project detail directly
                if (($rootScope.previousState.name == 'home.skills') || (globalState.fromProfile = true)) {
                    globalState.isSkillDetailView = true;
                    $scope.isSkillDetailView = globalState.isSkillDetailView;
                }
            }, function (reason) {
                console.log("Failed because " + reason);
            });

        //for the people table who have this skill
        mainFactory.getUsersWithSkill(skillID, manager)
            .then(function (data) {
                $scope.peopleWithSkill = data.items;
            }, function (reason) {
                console.log("Failed because " + reason);
            });
    }

    if ($stateParams.skillID) {
        getAllSkillDetails($stateParams.skillID);
    }

    $scope.navToSkill = function (skillID) {
        $state.go('home.skills.detail', {skillID: skillID});
    };
});
