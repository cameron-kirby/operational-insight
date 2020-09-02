(function () {
  'use strict';

  angular.module('ResrcUtilApp.SkillList')
    .controller('SkillListController', SkillListController);


  SkillListController.$inject = ['$cookies',
    '$log',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    'globalState',
    'mainFactory',
    'SKILL_COLORS',
    'utilities'
  ];

  function SkillListController($cookies,
    $log,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    globalState,
    mainFactory,
    SKILL_COLORS,
    utilities) {
    var global = globalState;
    var stateParams = $stateParams;
    var vm = this;
    vm.accordion = undefined;
    vm.back = undefined;
    vm.innerAccordion = undefined;
    vm.isLoading = false;
    vm.skillsList = [];
    vm.listLoaded = false;

    vm.getSkillUsers = getSkillUsers;
    vm.setColor = setColor;
    vm.switchToBubbleChart = switchToBubbleChart;


    activate();

    $scope.$on('changeTeam', function () {
      var skillsParams;
      vm.accordion.collapseAll();

      if (vm.innerAccordion) {
        vm.innerAccordion.collapseAll();
      }

      skillsParams = {
        manager: $cookies.get('myManager')
      };
      stateParams.manager = $cookies.get('myManager');
      $state.go('home.skillsList', skillsParams, { notify: false });
      getCategoryList();
    });


    /**
     * Initializes the controller.
     */
    function activate() {
      global.currentView.name = 'SkillsList';
      getCategoryList();

      if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        vm.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
      }
    }


    function getCategoryList() {
      var manager = utilities.syncManager($stateParams.manager);

      vm.isLoading = true;

      mainFactory.getCategoryList(manager)
        .then(function (data) {
          vm.skillsList = data.items;
          vm.listLoaded = true;
        })
        .catch(function (reason) {
          $log.error('Failed because ' + reason);
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }


    function getRandomColors() {
      return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }


    function getSkillUsers(id, categoryId) {
      var manager = utilities.syncManager($stateParams.manager);

      mainFactory.getUsersWithSkill(id, manager)
        .then(function (data) {
          vm.skillsList[categoryId].skills[id].people = data.items;
        })
        .catch(function (reason) {
          $log.error('Failed because ' + reason);
        });
    }


    function setColor(id) {
      if (!global.skillColorMapping[id]) {
        global.skillColorMapping[id] = getRandomColors();
      }

      return { 'background-color': global.skillColorMapping[id] };
    }


    function switchToBubbleChart() {
      var skillsParams = {
        manager: $cookies.get('myManager')
      };
      $state.go('home.skills', skillsParams);
    }
  }
}());
