/**
 * Created by Xunrong Li on 7/24/15.
 * Controller for skill detail page
 */
ResrcUtilApp.controller('SkillDetailController', function ($scope, $rootScope, mainFactory, globalState, $stateParams, $state, $cookies, utilities) {
    globalState.currentView.name = "SkillDetail";
    $scope.sortType = "fname";
    $scope.sortReverse = false;

    $scope.$on('initalLoadSkillDetail', function () {
        $stateParams.manager = $cookies.get("myManager");
        $state.go('home.skills.detail', {manager: $stateParams.manager, skillID: $stateParams.skillID}, {notify: false});
        getAllSkillDetails($stateParams.skillID);
    });

    function getAllSkillDetails(skillID) {
        var manager = utilities.syncManager($stateParams.manager);

        mainFactory.getSkillDetails(skillID, manager)
          .then(function (data) {
              console.log(data)
              $scope.skill = data.item;
              $rootScope.currentSkill = $scope.skill.name;

              //use url to go to the project detail directly
              if ($rootScope.previousState.name == 'home.skills') {
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
