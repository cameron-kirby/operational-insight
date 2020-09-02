/**
 * Created by Xunrong Li on 6/1/15.
 * Controller of Home page, including:
 * 1. Navigate between different views
 * 2. Handle full size status
 * 3. Handle overlay status
 * 4. Handle widget status and retrieve data from widget factory
 */
ResrcUtilApp.controller('MainController', function ($scope, $rootScope, globalState, $cookies, $window, mainFactory, $state, ModalFactory, $stateParams, $mdSidenav, UserAuthFactory) {
    $scope.user = {
        name: $cookies.get('myName'),
        id: $cookies.get('myID')
    };

    if(!globalState.userProfile._id) {
        mainFactory.getUserProfile($scope.user.id)
            .then(function (data) {
                $scope.person = data.item;
                globalState.userProfile = $scope.person;

                var myManager = $cookies.get("myManager");
                var myTeam = $cookies.get("myTeam");

                if ($scope.person.role !== 'Viewer') {
                    if(myManager === '' || myManager === undefined) {
                        $cookies.put('myManager', data.item.reports_to._id);
                    }

                    if(myTeam === '' || myTeam === undefined) {
                        $cookies.put('myTeam', data.item.reports_to.team);
                    }
                }
                else {
                    if(myManager === '' || myManager === undefined) {
                        $cookies.put('myManager', 'all');
                    }

                    if(myTeam === '' || myTeam === undefined) {
                        $cookies.put('myTeam', 'Enterprise Services Innovation Lab');
                    }
                }

                $scope.myManagerTeam = $cookies.get('myTeam');

            }, function (reason) {
                console.log("Failed because " + reason);
            });
    }
    else {
        $scope.person = globalState.userProfile;
        $scope.myManagerTeam = $cookies.get('myTeam');
    }

    //Full-size status of main-content area
    $scope.isFullSize = false;


    /*
     widget status
     enable - widget exists or not (depends on the full size event)
     */
    $scope.widgetsEnable = true;

    $scope.$on('changeTeam', function(event, args) {
        $scope.myManagerTeam = $cookies.get('myTeam');
    });

    /*
     set the main-content to be full-size
     and hide widgets
     */
    $scope.setFullSize = function () {
        $scope.isFullSize = !$scope.isFullSize;
        $scope.widgetsEnable = !$scope.widgetsEnable;
    };

    $scope.isOpen = function() { return $mdSidenav('menu').isOpen(); };

    $scope.goToProjects = function() {
        $state.go("home.projects", {filter: 'today', manager: $cookies.get("myManager")});
        globalState.currentView.toggle = "closed";
    };

    $scope.goToSkills = function() {
        $state.go("home.skills", {manager: $cookies.get("myManager")});
        globalState.currentView.toggle = "closed";
        globalState.isDetail = false;
        // $rootScope.$broadcast("updateisDetail");
    };

    $scope.goToPeople = function () {
        globalState.currentView.toggle = "closed";
        $state.go('home.people', {manager: $cookies.get("myManager")});
    };

    $scope.goToProfile = function (id) {
        $state.go('home.people.profile', {userID: id});
    };

    $scope.goToSettings = function (id) {
        $state.go('home.settings');
    };

    $scope.setFullSizeSettings = function () {
        $scope.isFullSize = true;
        $scope.widgetsEnable = false;
    };

    $scope.setDefaultSizeSettings = function () {
        $scope.isFullSize = false;
        $scope.widgetsEnable = true;
    };

    $scope.closeMenu = function() {
      if ($scope.isOpen) {
        $mdSidenav('menu').close();
      }
    };

    $scope.utilization = function () {
        $state.go('home.people.profile.edit.tab', {edit: 'Projects', userID: $cookies.get('myID')});
    };

    $scope.switchTeam = function() {
        setTimeout(function () {
            $scope.closeMenu();
            ModalFactory.switchTeams();
        }, 0);
    };

    $scope.logout = function() {
      UserAuthFactory.logout();
    }
    //get the current view for showing other views on the menu
    $scope.currentView = globalState.currentView;

    $scope.toggleMenu = buildToggler('menu');

    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID).toggle();
      };
    }
});
