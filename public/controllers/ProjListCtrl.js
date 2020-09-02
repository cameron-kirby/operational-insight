/**
 * Created by Xunrong Li on 7/8/15.
 * Controller for Card View, store view status
 */

ResrcUtilApp.controller('ProjectListController', function ($scope, $filter, $rootScope, mainFactory, globalState, $state, $q, $stateParams, $cookies, utilities) {
    //check if the top state in the stack is same as the current state
    var poppedState = $rootScope.opHistory.pop();
    if(poppedState!==undefined){
        if(!(poppedState.name === $state.current.name && poppedState.params.filter === $stateParams.filter)) {
            $rootScope.opHistory.push(poppedState);
        }
    }
    globalState.currentView.name = "Projects List";
    $scope.sortType = "total_hours";
    $scope.sortReverse = false;
    if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        $scope.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
    }

    $rootScope.$on('changeState', function (event, data) {
        if (data) {
            $scope.back = data.backLabel;
        }
    });

    // if filter is not provided in the url
    if($stateParams.filter===undefined)
    {
      var manager = utilities.syncManager($stateParams.manager);
      globalState.projectsFilter.value = 'today';
      globalState.projectsFilter.name = 'Today';

      checkFilterParam();
      $state.go("home.projectlist", {filter: 'today', manager: $stateParams.manager});
    }

    function checkFilterParam() {
        var manager = utilities.syncManager($stateParams.manager);
        var filter = '';

        // if filter is not provided in the url
        if ($stateParams.filter === undefined) {
            filter = 'today';
        }
        else {
            filter = $stateParams.filter;
        }

        $state.go("home.projectlist", {filter: $stateParams.filter, manager: manager}, {notify: false});
    }

    $scope.filters = [{"name": "Today", "value": "today"},
        {"name": "Last 30 Days", "value": "last30days"},
        {"name": "Last 90 Days", "value": "last90days"},
        {"name": "Next 30 Days", "value": "next30days"},
        {"name": "Next 90 Days", "value": "next90days"},
        {"name": "All Time", "value": "alltime"},
        {"name": "Up to Today", "value": "uptotoday"}];

    $scope.getFilters = function () {
        $(".search-result-range-item").show();
    };

    $scope.getFilterName = function (filter) {
        $scope.getFilters();
        for (var i = 0; i < $scope.filters.length; i++) {
            if ($scope.filters[i].value.indexOf(filter) === 0) {
                return $scope.filters[i].name;
            }
        }
    };

    //defaulting project list status filter
    $scope.allBuffer = {
        "name": "All"
    };

    $scope.selectedStatus = "All";
    $scope.statusFilter = "";


    // default value
    $scope.selectedRange = {};
    $scope.selectedRange.name = $scope.getFilterName($stateParams.filter);
    $scope.selectedRange.value = $stateParams.filter;
    if (globalState.projectsFilter.value != $stateParams.filter) {
        globalState.projectsFilter.value = $stateParams.filter;
        globalState.projectsFilter.name = $scope.getFilterName($stateParams.filter);
    }

    $scope.changeFilter = function (filter) {
        $scope.selectedRange.value = filter;
        $scope.selectedRange.name = $scope.getFilterName(filter);
        $scope.filters = [];
        globalState.projectsFilter.name = $scope.selectedRange.name;
        globalState.projectsFilter.value = $scope.selectedRange.value;
        $state.go("home.projectlist", {filter: filter});
    };

    $scope.goToTreeMap = function()
    {
        checkFilterParam();
        $state.go("home.projects", {filter: $stateParams.filter, manager: $stateParams.manager});
    };

    $scope.goToProjectDetail = function(projectID){
        checkFilterParam();
        $state.go('home.projects.detail', {projectID: projectID, filter: $stateParams.filter, manager: $stateParams.manager});
    };

    if($stateParams.filter!==undefined) {
        initiateProjList();
    }

    function initiateProjList() {
        $q.all([
            getStatus(),
            getProjects(globalState.projectsFilter.value)
        ]).then(function(data) {
            $scope.status = data[0];
            $scope.status.unshift($scope.allBuffer);
            $scope.projects = data[1].items;
            $scope.dataLoaded = true;
        });
    }

    $scope.$on('initalLoadProjectList', function () {
        $state.go("home.projectlist", {filter: $stateParams.filter,manager: $cookies.get("myManager")});
    });

    function getStatus() {
        var d = $q.defer();
        mainFactory.getDropdown("projectstatus")
            .then(function (data) {
                for (var i in data) {
                    if (data[i].name == "Life Cycle Management (LCM)") {
                        data[i].name = "Lifecycle Management";
                    }
                }
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function getProjects(range) {
        var d = $q.defer();

        checkFilterParam();

        $scope.projectListLoading = true;

        mainFactory.getAllProjects(range)
            .then(function (data) {
                d.resolve(data);
                $scope.projectListLoading = false;
            }, function (reason) {
                console.log("Failed because " + reason);
                $scope.projectListLoading = false;
            });
        return d.promise;
    }

    $scope.setColor = function(id) {
        return {"background-color" : globalState.projectColorMapping[id] };
    };

    $scope.showStatusFilter = function() {
        $(".status-filter-list").show();
    };

    $scope.selectStatusFilter = function(statusName) {
        $scope.selectedStatus = statusName;
        if(statusName == "All") {
            $scope.statusFilter = "";
        }
        else {
            $scope.statusFilter = statusName;
        }
    };
});
