/**
 * Created by Xunrong Li on 6/22/15.
 * Controller for widgets status and data
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .controller('WidgetsController', WidgetsController);

  WidgetsController.$inject = [
    '$cookies',
    '$scope',
    '$rootScope',
    '$log',
    'mainFactory',
    '$state',
    '$stateParams',
    'utilities',
    '$timeout'
  ];

  function WidgetsController(
    $cookies,
    $scope,
    $rootScope,
    $log,
    mainFactory,
    $state,
    $stateParams,
    utilities,
    $timeout
  ) {
    var widgetVM = this;
    var manager;

    widgetVM.OutOfOffice = {
      status: true,
      list: []
    };

    widgetVM.ClockWidget = {
      status: true,
      offsetRTP: -4,
      offsetGuadalajara: -5,
      offsetSingapore: 8
    };

    activate();


    /**
     * Updates the manager query parameter based upon the results of the switch team modal.
     */
    $scope.$on('changeTeam', function () {
      var params = $stateParams;

      params.manager = $cookies.get('myManager');
      $state.go($state.current.name, params, { notify: false });
    });


    /* -------------------------- */

    function activate() {
      return getVacation();
    }

    function getVacation() {
      var element;
      manager = utilities.syncManager($stateParams.manager);

      $timeout(function () {
        element = $('.out-of-office-widget .spinner, .out-of-office-widget .spinner-wrapper');
        element.css('display', 'block');
      });

      widgetVM.oofLoading = true;
      mainFactory.getListOutOfOffice(manager).then(function (data) {
        widgetVM.OutOfOffice.list = data.items;
        widgetVM.oofLoading = false;
        if (element) {
          element.hide();
        } else {
          $timeout(function () {
            element = $('.out-of-office-widget .spinner, .out-of-office-widget .spinner-wrapper');
            element.css('display', 'block');
            element.hide();
          });
        }
      }, function (reason) {
        $log.error('Failed because ' + reason);
        widgetVM.oofLoading = false;
        if (element) {
          element.hide();
        } else {
          $timeout(function () {
            element = $('.out-of-office-widget .spinner, .out-of-office-widget .spinner-wrapper');
            element.css('display', 'block');
            element.hide();
          });
        }
      });
    }

    $rootScope.$on('updateVacation', function () {
      getVacation();
    });

    $rootScope.$on('updateUserVacation', function () {
      getVacation();
    });

    $scope.$watch('widgetVM.ClockWidget.status', function (o) {
      if (o === false) {
        $('.out-of-office-widget').addClass('clock-is-closed');
      } else {
        $('.out-of-office-widget').removeClass('clock-is-closed');
      }
    });
  }
}());
