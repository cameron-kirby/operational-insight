/**
 * Created by Xunrong Li on 7/29/15.
 * directive for legend box of the bar chart
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .directive('legendBoxColor', legendBoxColor);

  legendBoxColor.$inject = ['$timeout', 'globalState'];

  function legendBoxColor($timeout, globalState) {
    var directive = {
      link: link,
      restrict: 'EA'
    };
    return directive;
    function link(scope, element, attrs) {
      $timeout(function () {
        attrs.$observe('style', function () {
          // assign colors to legend box
          $('.legend-box').each(function () {
            var id = $(this).attr('id');
            $(this).css('background-color', globalState.projectColorMapping[id]);
          });
        });
      });
    }
  }
}());
