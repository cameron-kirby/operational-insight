/**
 * Created by Jake Wernette on 10/14/15.
 */

(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .filter('isFuture', futureFilter);

  function futureFilter() {
    return function doIsFuture(items, startDate, endDate) {
      return items.filter(function futureCheck(item) {
        var now = moment().startOf('day');
        var end = moment(item[endDate]);

        return end.isAfter(now) || end.isSame(now);
      });
    };
  }
}());
