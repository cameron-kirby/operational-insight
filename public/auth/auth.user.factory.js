/*
 UserAuthFactory - communicate with backend for auth service, including two functions
 login - encode and append auth to request header and send the request
 logout - set log status, clean cookies and redirect to login page
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .factory('UserAuthFactory', UserAuthFactory);

  UserAuthFactory.$inject = [
    '$base64',
    '$http',
    'AuthenticationFactory',
    '$window',
    '$state',
    '$cookies',
    '$q',
    'REST_URL',
    '$rootScope',
    '$log'
  ];

  function UserAuthFactory(
    $base64,
    $http,
    AuthenticationFactory,
    $window,
    $state,
    $cookies,
    $q,
    REST_URL,
    $rootScope,
    $log
  ) {
    return {
      login: function (username, password) {
        var deferred = $q.defer();
        var auth = 'Basic ' + $base64.encode(username + ':' + password);

        var req = {
          method: 'POST',
          url: REST_URL.hostname + '/login',
          headers: {
            authorization: auth
          }
        };

        $http(req).then(function (data) {
          $cookies.put('myToken', data.token);
          deferred.resolve(data);
        })
        .catch(function (error) {
          var errorObject = {
            error_code: error.status
          };

          $log.error('error status is ' + error.status + ' the response content is '
           + error.statusText);
          deferred.reject(errorObject);
        });

        return deferred.promise;
      },

      loginWithToken: function (userId, token) {
        var deferred = $q.defer();

        var req = {
          data: {
            userId: userId,
            token: token
          },
          method: 'POST',
          url: REST_URL.hostname + '/login'
        };

        $http(req).then(function (data) {
          $cookies.put('myToken', data.data.token);
          $cookies.put('myID', data.data.user.id);
          deferred.resolve(data);
        })
        .catch(function (error) {
          var errorObject = {
            error_code: error.status
          };

          $log.error('error status is ' + error.status + ' the response content is '
           + error.statusText);
          deferred.reject(errorObject);
        });

        return deferred.promise;
      },

      logout: function () {
        var root = $rootScope.opHistory;
        var auth = AuthenticationFactory;

        root.length = 0;

        if (auth.isLogged) {
          auth.isLogged = false;
          delete auth.user;
          delete auth.userRole;

          // clean cookies
          $cookies.remove('myToken');
          $cookies.remove('myID');
          $cookies.remove('myName');
          $cookies.remove('myUserRole');
          $cookies.remove('myManager');
          $cookies.remove('myTeam');

          // redirect to login page
          $state.go('login');
        }
      }
    };
  }
}());
