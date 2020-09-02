/**
 * Created by Xunrong Li on 8/3/15.
 */

(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .filter('truncate', truncateFilter);

  function truncateFilter() {
    return function doTruncate(text, length) {
      var returnString;
      var len = length;
      var end = '...';

      if (isNaN(len)) { len = 10; }

      if (text) {
        if (text.length <= length || text.length - end.length <= length) {
          returnString = text;
        } else {
          returnString = String(text).substring(0, length - end.length) + end;
        }
      }
      return returnString;
    };
  }
}());
