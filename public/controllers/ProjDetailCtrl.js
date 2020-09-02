/*
 * Created by Xunrong Li on 6/1/15.
 * Controller for Tree Map, store view status
 */
ResrcUtilApp.controller('ProjectDetailController', function ($scope, $rootScope, $filter, mainFactory, globalState, $stateParams, $state, IPT_URL, $cookies, utilities) {

    globalState.currentView.name = "Project Detail";
    $scope.sortType = "fname";
    $scope.sortReverse = false;
    var filter = $stateParams.filter;
    var manager =  $stateParams.manager;

    if (filter === undefined || manager === undefined) {
        if (filter === undefined) {
            filter = 'today';
            $stateParams.filter = 'today';
            globalState.projectsFilter.value = 'today';
            globalState.projectsFilter.name = 'Today';
            $scope.selectedRange.value = 'today';
            $scope.selectedRange.name = 'Today';
        }

        if (manager === undefined) {
            $stateParams.manager = $cookies.get("myManager");
        }
        $state.go('home.projects.detail', {projectID: $stateParams.projectID, filter: $stateParams.filter, manager: $stateParams.manager});
    }
    //check if the top state and params in the stack is same as the current state and param
    // if so delete the top state in the stack
    var poppedState = $rootScope.opHistory.pop();
    if (poppedState !== undefined) {
        if (!((poppedState.name === $state.current.name) && (poppedState.params.filter === $stateParams.filter) && poppedState.params.projectID === $stateParams.projectID)) {
            $rootScope.opHistory.push(poppedState);
        }
    }

    //might not be used
    if ($rootScope.previousState.name == 'home.projects' || $rootScope.previousState.name == 'home.projects.detail') {
        $rootScope.$broadcast('projectDetail');
    }

    $scope.$on('initalLoadProjectDetail', function () {
        $stateParams.manager = $cookies.get("myManager");

        $state.go('home.projects.detail', {manager: $stateParams.manager}, {notify: false});
        getProjectDetail();
    });

    getProjectDetail();

    function getProjectDetail() {
        if ($stateParams.projectID) {
          var manager = utilities.syncManager($stateParams.manager);

            //sending request to get project detail
            mainFactory.getProjectDetail($stateParams.projectID, filter, manager)
                .then(function (data) {
                    $scope.project = data.item;
                    $rootScope.currentProject = $scope.project.name;
                    var ipt_record = $scope.project.IPT_record;
                    $scope.ipt_link = $scope.project.IPT_record;
                    $scope.ipt_url = IPT_URL;
                    if (ipt_record !== undefined && ipt_record.indexOf("IPT") > 0) {
                        $scope.project.IPT_record = ipt_record.substr(ipt_record.indexOf("IPT"));
                    }
                    else if (ipt_record !== undefined && ipt_record.indexOf("ipt") > 0) {
                        $scope.project.IPT_record = ipt_record.substr(ipt_record.indexOf("ipt"));
                    }
                    else {
                        $scope.project.IPT_record = undefined;
                    }
                    // push the browsing user to front if he is present in that project
                    for (var i = 0; i < data.item.team.length; i++) {
                        if (data.item.team[i].id === globalState.userProfile._id) {
                            var user = data.item.team[i];
                            $scope.project.team.splice(data.item.team.indexOf(data.item.team[i]), 1);
                            $scope.project.team.unshift(user);
                        }

                    }
                    //store the value for modal use
                    globalState.projectDetails = $scope.project;
                    globalState.projectID = $stateParams.projectID;
                    //setting isProjectDetail after receiving the data
                    if ($rootScope.previousState.name == 'home.projects') {
                        globalState.isProjectDetailView = true;
                        $scope.isProjectDetailView = globalState.isProjectDetailView;
                    }

                }, function (reason) {
                    console.log("Failed because " + reason);
                });
        }
        else {
            console.log("the project ID is " + $stateParams.projectID);
        }
    }

    $scope.$on('updateProjectDetails', function () {
        $scope.project = globalState.projectDetails;
    });
});
