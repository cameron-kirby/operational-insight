/**
 * Created by Xunrong Li on 6/20/15.
 * Customized filter for capitalizing words
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .filter('capitalize', capitalizeFilter);

  function capitalizeFilter() {
    return function doCapitalize(input) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function capitalizeRegex(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }) : '';
    };
  }
}());
