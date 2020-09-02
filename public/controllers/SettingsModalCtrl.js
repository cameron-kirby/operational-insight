/**
 * Created by Caesar Cavales on 11/12/15.
 * Modal Service - open modal when entering home.people.profile.edit state
 * Added open modal for settings confirmation view
 */
(function () {
  'use strict';

  angular
  .module('ResrcUtilApp')
  .controller('settingsModalCtrl', settingsModalCtrl);

  function settingsModalCtrl(
    $scope,
    $rootScope,
    $modalInstance
  ) {
    var vm = this;
    var root = $rootScope;

    // deletes settings value if confirmed
    vm.settingsConfirm = function () {
      root.$broadcast('settingsDelYes');
      $modalInstance.dismiss();
    };

    vm.settingsCancel = function () {
      root.$broadcast('settingsDelNo');
      $modalInstance.dismiss();
    };
  }
}());
