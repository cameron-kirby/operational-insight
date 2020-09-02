/**
 * Created by Xunrong Li on 7/8/15.
 * Controller for Card View, store view status
 */

ResrcUtilApp.controller('CardViewController', function ($scope, $filter, $rootScope, mainFactory, globalState, $state, $stateParams, $cookies, utilities) {

    globalState.currentView.name = "People";
    globalState.currentView.toggle = "closed";

    if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        $scope.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
    }

    $rootScope.$on('changeState', function (event, data) {
        if (data) {
            $scope.back = data.backLabel;
        }
    });

    var bookmark = '';
    var people = [];
    var processing = false;
    var items = ['initial'];

    $scope.$on('initalLoadCardView', function () {
        bookmark = '';
        people = [];
        items = ['initial'];
        $stateParams.manager = $cookies.get("myManager");
        $state.go('home.people', {manager: $stateParams.manager}, {notify: false});
        getUsers();
    });

    $rootScope.$on('getUsers', function () {
        getUsers();
    });

    if ($state.current.name === "home.people") {
        getUsers();
    }

    function getUsers() {
      var manager = utilities.syncManager($stateParams.manager);

      if (!processing && items.length > 0) {
        processing = true;

        if (!bookmark) {
          $rootScope.cardViewLoading = true;
        }
        //get a list of the users
        mainFactory.getUsers(50, bookmark, undefined, manager)
          .then(function (data) {
            bookmark = data.pageInfo.bookmark;
            people = people.concat(data.items);
            $scope.people = people;
            items = data.items;
            processing = false;

            $rootScope.cardViewLoading = false;
          }, function (reason) {
            $rootScope.cardViewLoading = false;
            console.log("Failed because " + reason);
          });
      }
    }

    $scope.getUsers = function() {
        getUsers();
    };

    $scope.goToPeopleList = function () {
        var manager = utilities.syncManager($stateParams.manager);

        $state.go("home.peoplelist", {manager: manager});
    };

    if ($state.current.name === 'home.people.profile') {
        $scope.isProfileDetailView = true;
    }
    //detect state change event
    $scope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
        if (toState.name === "home.people") {
            $scope.isProfileDetailView = false;
            globalState.currentView.name = "People";
            globalState.currentView.toggle = "closed";
        }
        else if (toState.name === "home.people.profile") {
            $scope.isProfileDetailView = true;
        }
    });
});
