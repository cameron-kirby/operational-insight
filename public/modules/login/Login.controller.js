/**
 * Created by Micah Brown
 * Edited by Xunrong Li on 7/1/15
 * Controller of Login page and floating button, including: login and logout methods
 */
(function () {
  'use strict';

  angular
    .module('ResrcUtilApp.Login')
    .controller('LoginController', Login);

  Login.$inject = [
    '$scope',
    '$stateParams',
    '$rootScope',
    '$cookies',
    '$state',
    '$location',
    '$window',
    '$q',
    '$mdSidenav',
    '$log',
    'UserAuthFactory',
    'AuthenticationFactory',
    'mainFactory',
    'globalState',
    'utilities'
  ];

  function Login(
    $scope,
    $stateParams,
    $rootScope,
    $cookies,
    $state,
    $location,
    $window,
    $q,
    $mdSidenav,
    $log,
    UserAuthFactory,
    AuthenticationFactory,
    mainFactory,
    globalState,
    utilities
  ) {
    var vm = this;
    var auth = AuthenticationFactory;
    var global = globalState;
    var root = $rootScope;
    var state = $state;

    var nextState = '';
    var nextStateAction = '';

    vm.assignCookies = assignCookies;
    vm.err_message = '';
    vm.login = login;
    vm.logout = logout;
    vm.showLogin = true;
    vm.userId = '';

    activate();


    /**
     * Initializes the controller.
     */
    function activate() {
      var token = $stateParams.token;
      AuthenticationFactory.setTokenAccess(false);

      // show home page if token is already there
      if ($cookies.get('myToken') && state.current.name === 'login'
        && !token) {
        vm.showLogin = false;
        state.go('home.projects', { manager: $cookies.get('myManager') });
      }

      vm.userId = $stateParams.userId;
      vm.err_message = $stateParams.message;
      nextState = $stateParams.nextState;
      nextStateAction = $stateParams.action;

      if (token) {
        root.loading = true;
        UserAuthFactory.loginWithToken(vm.userId, token)
          .then(parseLoginResponse)
          .then(mainFactory.getUserProfile)
          .then(assignCookies)
          .then(function (cookieData) {
            root.loading = false;
            $cookies.put('myManager', cookieData.id);
            $cookies.put('myTeam', cookieData.team);
            loginSuccess(cookieData, vm.userId);
          })
          .catch(function (error) {
            root.loading = false;
            loginError(error);
            vm.err_message = 'Session Expired. Please login again.';
          });
      }
    }


    /**
     * Parses the login response.
     *
     * @param {JSONObject} loginResponse
     *    The successful response from the login call.
     *
     * @returns {Promise}
     *    The promise to parse the login response.
     */
    function parseLoginResponse(loginResponse) {
      var deferred = $q.defer();

      auth.isLogged = true;
      auth.user = loginResponse.data.user.userName;
      auth.userRole = loginResponse.data.user.userRole;
      auth.fname = loginResponse.data.user.fname;
      auth.lname = loginResponse.data.user.lname;

      // store user information and token to cookies for cross-tabs use
      $cookies.put('myToken', loginResponse.data.token);
      $cookies.put('myID', loginResponse.data.user.userName);
      $cookies.put('myName', loginResponse.data.user.fname + ' ' + loginResponse.data.user.lname);
      $cookies.put('myUserRole', loginResponse.data.user.userRole);
      deferred.resolve(loginResponse.data.user.userName);

      return deferred.promise;
    }


    function assignCookies(userData) {
      var d = $q.defer();
      var managerTeam = {};

      global.userProfile = userData.item;
      if (userData.item.role === 'Viewer' || !userData.item.reports_to) {
        mainFactory.getOneManager('all').then(function (managerData) {
          managerTeam.id = managerData.item._id;
          managerTeam.team = managerData.item.team;

          d.resolve(managerTeam);
        })
        .catch(function (error) {
          $log.error('Failed because ' + error);
          loginError(error);
        });
      } else {
        managerTeam.id = userData.item.reports_to._id;
        managerTeam.team = userData.item.reports_to.team;

        d.resolve(managerTeam);
      }

      return d.promise;
    }

    function login() {
      /*
       use jquery val instead of ng-model
       because auto-complete content in the model would be remove by the jquery clear plugin
       */
      var password = $('#inputPassword').val();

      if (vm.userId && password) {
        // send request to login endpoint
        root.loading = true;

        UserAuthFactory.login(vm.userId, password)
          .then(parseLoginResponse)
          .then(mainFactory.getUserProfile)
          .then(assignCookies)
          .then(function (cookieData) {
            root.loading = false;
            $cookies.put('myManager', cookieData.id);
            $cookies.put('myTeam', cookieData.team);
            loginSuccess(cookieData, vm.userId);
          })
          .catch(function (error) {
            loginError(error);
          });
      } else {
        root.loading = false;
        vm.err_message = 'You are missing IntranetID or Password. ' +
        'Please enter your credentials and try again.';
      }
    }

    function logout() {
      UserAuthFactory.logout();
    }

    /**
     * Sends a error response to the user upon failing to login.
     *
     * @param {Object} error
     *    The error object.
     */
    function loginError(error) {
      var cookies;
      root.loading = false;

      cookies = $cookies.getAll();
      angular.forEach(cookies, function (value, key) {
        $cookies.remove(key);
      });

      if (error.error_code === 401) {
        vm.err_message = 'The sign in attempt failed. ' +
        'You may have incorrectly entered your Internet e-mail ID or password.';
      } else if (error.error_code === 403) {
        vm.err_message = 'You do not have access to our application. ' +
        'Please contact the application admin ' + utilities.getContactPerson() + '.';
      } else {
        vm.err_message = 'Login failed.';
      }
    }

    /**
     * Logs a user into the application.
     *
     * @param {Object} data
     *    The user's login data.
     */
    function loginSuccess(data, userId) {
      var historyState;

      if (nextState === 'editProfile') {
        state.go('home.people.profile', { userID: userId, action: nextStateAction });
      } else if (root.storedState) {
        // direct to the url that you just put in.
        if (root.storedParams) {
          root.storedParams.manager = data.id;
          $state.go(root.storedState, root.storedParams);
        } else {
          $state.go(root.storedState, { manager: data.id });
        }
      } else {
        historyState = root.opHistory.pop();
        if (historyState && historyState.name) {
          historyState.params.manager = data.id;
          $state.go(historyState.name, historyState.params);
        } else {
          // if not using a url, direct to the home page
          $state.go('home.projects', { manager: data.id });
        }
      }
    }
  }
}());
