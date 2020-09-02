/**
 * Created by Xunrong Li on 7/23/15.
 * Tree Map Controller set the currentView and isProjectDetailView
 * Handle two situations - go to project detail directly or go to the tree map first
 */
ResrcUtilApp.controller('TreeMapController', function ($scope, $rootScope, $window, globalState, $state, $filter, $stateParams, $cookies, PROJECT_COLORS, utilities) {
    //check if the top state and params in the stack is same as the current state and param

    // if so delete the top state in the stack
    var poppedState = $rootScope.opHistory.pop();

    if (poppedState !== undefined) {
        if (!((poppedState.name === $state.current.name) && (poppedState.params.filter === $stateParams.filter))) {
            $rootScope.opHistory.push(poppedState);
        }
    }

    if ($rootScope.opHistory[$rootScope.opHistory.length - 1]) {
        $scope.back = $rootScope.opHistory[$rootScope.opHistory.length - 1].backLabel;
    }

    $rootScope.$on('changeState', function (event, data) {
        if (data) {
            $scope.back = data.backLabel;
        }
    });

    //change currentView title for panel header and toggle for floating button
    globalState.currentView.name = "Projects";
    globalState.currentView.toggle = "closed";
    // $scope.projects = globalState.projects;

    //selects a random background-color project details if accessed from profile view
    $scope.randColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];

    /*
     Here we use globalState factory store the isProjectDetailView
     so that the ProjectDetailController could have access to the state
     */
    if ($state.current.name == "home.projects.detail") {
        //if go the a project detail page directly
        if ($rootScope.previousState.name !== "home.projects") {
            $scope.goToProjectDirectly = true;

            /*
             to simulate the tree map zoom in to this project box,
             set the isProjectDetailView to be false until zoom-in ends
             (i.e change the value in TreeMapDirective Zoom function)
             */
            globalState.isProjectDetailView = false;
            //debugger;
        }
        // else {
        //     $scope.goToProjectDirectly = false;
        //     globalState.isProjectDetailView = true;
        // }
    }
    else {
        //if enter to project tree map first
        globalState.isProjectDetailView = false;
        $scope.goToProjectDirectly = false;
    }

    $scope.$on('defaultProjFromProfile', function () {
        fromProfile();
    });

    $scope.$on('assignProjects', function () {
        $scope.projects = globalState.projects;
    });

    $scope.treeMapView = true;
    $scope.isProjectDetailView = globalState.isProjectDetailView;
    $scope.projectView = 'Tree';
    fromProfile();

    function fromProfile () {
        if ($state.current.name === "home.projects.projectDetail") {
            globalState.fromProfile = true;
        }
        else {
           globalState.fromProfile = false;
        }

        $scope.fromProfile = globalState.fromProfile;
    }

    $scope.filters = [{"name": "Today", "value": "today"},
            {"name": "Last 30 Days", "value": "last30days"},
            {"name": "Last 90 Days", "value": "last90days"},
            {"name": "Next 30 Days", "value": "next30days"},
            {"name": "Next 90 Days", "value": "next90days"},
            {"name": "All Time", "value": "alltime"},
            {"name": "Up to Today", "value": "uptotoday"}];

    $scope.filters = $scope.filters.sort($filter('predicatBy')("name"));

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

    // default value
    $scope.selectedRange = {};
    $scope.selectedRange.name = $scope.getFilterName($stateParams.filter);
    $scope.selectedRange.value = $stateParams.filter;

    if (globalState.projectsFilter.value != $stateParams.filter) {
        globalState.projectsFilter.value = $stateParams.filter;
        globalState.projectsFilter.name = $scope.getFilterName($stateParams.filter);
    }

    $scope.changeFilter = function (filter) {
      var manager = utilities.syncManager($stateParams.manager);

      $scope.selectedRange.value = filter;
      $scope.selectedRange.name = $scope.getFilterName(filter);
      globalState.projectsFilter.name = $scope.selectedRange.name;
      globalState.projectsFilter.value = $scope.selectedRange.value;

      if (globalState.isProjectDetailView === true) {
          $state.go("home.projects.detail", {projectID: globalState.projectID, filter: filter, manager: manager});
      }
      //if filter is changed while you are on project details accessed from profile view
      else if ($state.current.name === "home.projects.projectDetail") {
          $rootScope.$broadcast('changeFilter', {filter: filter});
      }
      else {
          $state.go("home.projects", {filter: filter, manager: manager});
      }
    };

    $scope.goToProjectList = function () {
      var manager = utilities.syncManager($stateParams.manager);

      $state.go("home.projectlist", {filter: $stateParams.filter, manager: manager});
    };

    $scope.$watch(function () {
        return $state.current.name;
    }, function (value) {
        // do stuff
        if (value !== "home.projects" && value !== "home.skills") {
            $('.info-btn').hide();
        } else {
            $('.info-btn').show();
        }
    });

    $scope.changeProjectView = function (view) {
        $scope.projectView = view;

        if (view === "Tree") {
            $rootScope.$broadcast('reloadTree');
        } else {
            $scope.projects = globalState.projects;
        }
    };

    $scope.setColor = function (id) {
        return {"background-color": globalState.projectColorMapping[id]};
    };
});
