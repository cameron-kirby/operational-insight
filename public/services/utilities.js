/* Created by Caesar Cavales on 03/02/2016
 * Utility service to store common functions accross the application
 * Last edited by Caesar Cavales on 03/02/2016
 */

(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .factory('utilities', utilities);

  function utilities(
    $window,
    $cookies
  ) {
    var service = {
      getAllYearsBetween: getAllYearsBetween,
      getContactPerson: getContactPerson,
      syncManager: syncManager
    };

    return service;

    function getAllYearsBetween(yearStart, yearEnd) {
      var allYears = [];
      var a = new Date(yearStart).getFullYear();
      var b = new Date(yearEnd).getFullYear();
      var i = a;

      for (i; i <= b; i++) {
        allYears.push(i);
      }

      return allYears;
    }

    function getContactPerson() {
      var appRoute = window.location.hostname;
      var contactPerson = '';

      if (appRoute === 'op-in.w3ibm.mybluemix.net') {
        contactPerson = 'Nghi D Ho/Raleigh/IBM';
      } else if (appRoute === 'esanalytics-opin.w3ibm.mybluemix.net') {
        contactPerson = 'Jennifer Yen/Raleigh/IBM or Kevin V Branin/Raleigh/IBM';
      } else {
        contactPerson = 'Nghi D Ho/Raleigh/IBM';
      }

      return contactPerson;
    }

    function syncManager(mgrParam) {
      var mgrCookie = $cookies.get('myManager');

      if (mgrParam && (mgrCookie !== mgrParam)) {
        $cookies.put('myManager', mgrParam);
      }

      return $cookies.get('myManager');
    }
  }
}());
