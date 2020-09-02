/**
 * Created by Caesar Cavales on 6/20/15.
 * Customized filter for sorting based on element name
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .filter('predicatBy', predicateFilter);

  function predicateFilter() {
    return function doPredicate(prop) {
      return function sortByElement(a, b) {
        var x;
        var y;

        if (a[prop]) {
          x = a[prop].toLowerCase();
        }

        if (b[prop]) {
          y = b[prop].toLowerCase();
        }
        
        if (x > y) {
          return 1;
        } else if (x < y) {
          return -1;
        }
        return 0;
      };
    };
  }
}());
