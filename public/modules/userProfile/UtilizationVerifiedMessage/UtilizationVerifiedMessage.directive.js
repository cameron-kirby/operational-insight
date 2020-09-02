(function () {
  'use strict';


  angular.module('ResrcUtilApp.UserProfile')
    .directive('opinUtilizationVerifiedMessage', OpinUtilizationVerifiedMessage);


  /**
   * This directive creates the overlay, which appears after a user clicks upon the
   * 'Verify' utilization button, on the user profile page. The screen darkens, and
   * a green circle with an animated checkmark appears. Beneath the checkmark, is the
   * message 'Utilization Verified'.
   */
  function OpinUtilizationVerifiedMessage() {
    var directive = {
      bindToController: true,
      controller: 'UtilizationVerifiedMessageController',
      controllerAs: 'vm',
      restrict: 'E',
      templateUrl: '/modules/userProfile/UtilizationVerifiedMessage/UtilizationVerifiedMessage.html'
    };


    return directive;
  }
}());
