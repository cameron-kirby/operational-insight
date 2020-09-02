/**
 * Created by Caesar Cavales on 2/2/16.
 * Controller for People list
 */
ResrcUtilApp.controller('PeopleListController', function ($scope, $state, $stateParams, $cookies, mainFactory, globalState, $timeout, $filter, PROJECT_COLORS, $rootScope, $q, utilities) {
    globalState.currentView.name = "People List";
    globalState.currentView.toggle = "closed";

    if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        $scope.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
    }

    $rootScope.$on('changeState', function (event, data) {
        if (data) {
            $scope.back = data.backLabel;
        }
    });

    var bookmark = '',
        processing = false,
        items = ['initial'];

    $scope.sortType = "start_date";
    $scope.sortReverse = true;

    $scope.yearFilters = [];
    var todaysYear = new Date();
    $scope.yearFilter = todaysYear.getFullYear();

    $scope.$on('initalLoadPeopleList', function () {
        bookmark = '';
        processing = false;
        items = ['initial'];

        if ($scope.accordion) {
            $scope.accordion.collapseAll();
        }

        $stateParams.manager = $cookies.get("myManager");
        $state.go('home.peoplelist', {manager: $stateParams.manager}, {notify: false});
        getPeopleList($scope.yearFilter, true);
    });

    $scope.showYearFilter = function() {
        $(".filter-list").show();
    };

    if ($state.current.name === "home.peoplelist") {
        getPeopleList($scope.yearFilter, true);
    }

    function getPeopleList(dateFilter, initial) {
        $scope.manager = utilities.syncManager($stateParams.manager);
        $scope.peopleListLoading = true;
        //get a list of the users
        mainFactory.getUtilizations(dateFilter, $scope.manager, 50, bookmark)
            .then(function (data) {
                bookmark = data.pageInfo.bookmark;
                $scope.people = data.items;
                if (initial){
                    $scope.yearFilters = data.pageInfo.yearFilters.sort(sortNumber);
                }
                $scope.peopleListLoading = false;

            }, function (reason) {
              $scope.peopleListLoading = false;
              console.log("Failed because " + reason);
            });
    }

    $scope.loadMore = function() {
        if (!processing && items.length > 0) {
            processing = true;

            mainFactory.getUtilizations($scope.yearFilter, $scope.manager, 50, bookmark)
                .then(function (data) {
                    bookmark = data.pageInfo.bookmark;
                    $scope.people = $scope.people.concat(data.items);   //.sort($filter('predicatBy')("user_id"))
                    items = data.items;
                    processing = false;
                }, function (reason) {
                    console.log("Failed because " + reason);
                });
        }
    };

    function sortNumber(a,b) {
        return b - a;
    }

    $scope.setColor = function(id) {
        if (!globalState.projectColorMapping[id]) {
            globalState.projectColorMapping[id] = getRandomColors();
        }

        return {"background-color" : globalState.projectColorMapping[id] };
    };

    function getRandomColors() {
        return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
    }

    $scope.applyYearFilter = function(year) {
        bookmark = '';
        processing = false;
        items = ['initial'];

        if ($scope.accordion) {
            $scope.accordion.collapseAll();
        }

        $scope.yearFilter = year;
        getPeopleList(year, false);
    };

    $scope.goToPeople = function() {
        $state.go('home.people', {manager: $cookies.get("myManager")});
    };
});
