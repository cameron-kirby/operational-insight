/**
 * Created by Xunrong Li on 6/11/15.
 * Controller for Bubble Chart, store view status
 */

(function () {
  'use strict';

  ResrcUtilApp.controller('BubbleChartController', BubbleChartController);

  BubbleChartController.$inject = [
    '$location',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'globalState',
    'mainFactory',
    'SKILL_COLORS'
  ];

  function BubbleChartController($location,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $timeout,
    globalState,
    mainFactory,
    SKILL_COLORS) {
    var vm = this;
    vm.setColor = setColor;
    vm.switchToListView = switchToListView;

    globalState.currentView.name = 'Skills';
    globalState.currentView.toggle = 'closed';
    globalState.isDetail = false;

    $scope.isDetail = globalState.isDetail;

    // Default to list all skills randomly
    $scope.tab = 'all';
    $scope.sortType = 'lname';
    $scope.sortReverse = true;
    $scope.isSkillDetailView = false;

    // Selects a random background-color project details if accessed from profile view
    $scope.randColor = SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];

    activate();

    $rootScope.$on('changeState', function (event, data) {
      if (data) {
        $scope.back = data.backLabel;
      }
    });

    $scope.$on('updateFilteredBubbleData', function () {
      $scope.filteredSkills = globalState.filteredBubbleData.items;
    });

    $scope.$on('updateisDetail', function () {
      $scope.isDetail = globalState.isDetail;
    });

    $scope.$on('defaultSkillFromProfile', function () {
      fromProfile();
    });

    function fromProfile() {
      if ($state.current.name === 'home.skills.skillDetail') {
        globalState.fromProfile = true;
      }
      else {
        globalState.fromProfile = false;
      }

      $scope.fromProfile = globalState.fromProfile;
    }


    $scope.changeTab = function (tab) {
      $scope.tab = tab;
      $scope.$broadcast('changeTab', tab);
    };

    /**
     * Initializes this controller.
     */
    function activate() {
      fromProfile();

      if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        $scope.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
      }

      if ($state.current.name === 'home.skills.detail') {
        $scope.goToSkillDirectly = true;

        /*
          to simulate the skill map zoom in to this project box,
          set the isSkillDetailView to be false until zoom-in ends
          (i.e change the value in TreeMapDirective Zoom function)
          */
        globalState.isSkillDetailView = false;
      } else {
        // If enter to bubble chart page first
        globalState.isSkillDetailView = false;
        $scope.goToSkillDirectly = false;
      }

      $scope.isSkillDetailView = globalState.isSkillDetailView;
    }

    function getRandomColors() {
      return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }

    function setColor(id) {
      if (!globalState.skillColorMapping[id]) {
        globalState.skillColorMapping[id] = getRandomColors();
      }

      return { 'background-color': globalState.skillColorMapping[id] };  
    }

    function switchToListView() {
      var skillsParams = {
        manager: $stateParams.manager
      };
      $state.go('home.skillsList', skillsParams);
    }
  }
}());
