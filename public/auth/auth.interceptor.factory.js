/*
 Intercept token for every http request
 Note: d3 requests have to set token manually
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .factory('TokenInterceptor', TokenInterceptor);

  TokenInterceptor.$inject = ['$cookies', '$q'];

  function TokenInterceptor($cookies, $q) {
    return {
      request: function (config) {
        var c = config;
        c.headers = c.headers || {};

        if ($cookies.get('myToken')) {
          c.headers['X-Access-Token'] = $cookies.get('myToken');
        }
        return config || $q.when(config);
      },

      response: function (response) {
        return response || $q.when(response);
      }
    };
  }
}());
