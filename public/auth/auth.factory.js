/*
 AuthenticationFactory - store auth information and check when page refresh
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp')
    .factory('AuthenticationFactory', AuthenticationFactory);

  AuthenticationFactory.$inject = ['$cookies'];

  function AuthenticationFactory($cookies) {
    var auth = {
      tokenAccess: false,
      isLogged: false,
      check: function () {
        if (auth.tokenAccess === true
            || $cookies.get('myToken')) {
          this.isLogged = true;
        } else {
          this.isLogged = false;
          delete this.user;
        }
      },
      setTokenAccess: function (value) {
        auth.tokenAccess = value;
      }
    };
    return auth;
  }
}());
