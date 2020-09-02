/**
 * Created by Xunrong Li on 8/12/15.
 * The Controller for Modal, for know different tab, getting skills/details from Profile Controller
 * Updating skills/details/projects calling factory
 */

ResrcUtilApp.controller('ModalProjectController', function ($scope, mainFactory, $modalInstance, $timeout, $q,
                                                            $state, $stateParams, $rootScope, globalState, $filter,$cookies) {
    $scope.errorMessage = '';

    var projManagerSelected = false;
    $q.all([
        getStatus(),
        getGeo(),
        getProcess()
    ]).then(function (data) {
        $scope.status = data[0].sort($filter('predicatBy')("name"));
        $scope.geo = data[1].sort($filter('predicatBy')("name"));
        $scope.process = data[2].sort($filter('predicatBy')("name"));
        $scope.loaded = true;
    });

    $scope.leads = [];
    $scope.techLead = {};

    $scope.managers = [];
    $scope.projMang = {};

    function getStatus() {
        var d = $q.defer();
        mainFactory.getDropdown("projectstatus")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function getGeo() {
        var d = $q.defer();
        mainFactory.getDropdown("projectgeo")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function getProcess() {
        var d = $q.defer();
        mainFactory.getDropdown("projectprocess")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function searchFaces(q) {
        var d = $q.defer();
        mainFactory.searchFaces(q)
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                d.reject(reason);
            });
        return d.promise;
    }

    //functions for technical Lead dropdowns
    $scope.filterTechLead = function (q) {
        $(".tech-lead-search-result").show();

        searchFaces(q).then(function (data) {
            $scope.filteredTechLead = data;
        });
    };

    function checkTechLead(newLead) {
        var isExist = false;

        angular.forEach($scope.leads, function(value, key) {
            if(value.id == newLead.email) {
                isExist = true;
                $('.exist-lead-' + value.uid).fadeOut(500).fadeIn(500);
            }
        });

        if(isExist === false) {
            if($scope.leads.length < 5) {
                $scope.techLead = {};

                $scope.techLead.uid = newLead.uid;
                $scope.techLead.id = newLead.email;
                $scope.techLead.name = newLead.name;
                $scope.leads.push($scope.techLead);
            }
            else {
                var message = 'Cannot add more than 5 technical leads';
                $scope.errorMessage = message;
                console.log(message);
            }
        }
        else {
            console.log("tech lead: " + newLead.name + " already exists");
        }
    }

    $scope.selectTechLead = function (newLead) {
        checkTechLead(newLead);

        $scope.filteredTechLead = null;
        $scope.leads.techLeadNew = "";
    };

    $scope.removeLead = function(idx) {
        $scope.leads[idx].isRemove = true;

        setTimeout(function() {
            $scope.leads.splice(idx, 1);
        }, 150);
    };

    $scope.$on("changeLeadEdit", function() {
        $scope.leads.techLeadNew = "";
    });

    //functions for project managers dropdowns
    $scope.filterProjMgr = function (q) {

        $(".proj-mngr-search-result").show();

        searchFaces(q).then(function (data) {
            $scope.filteredProjManager = data;
        });
    };

    function checkProjMgr(newProjMgr) {
        var isExist = false;

        angular.forEach($scope.managers, function(value, key) {
            if(value.id == newProjMgr.email) {
                isExist = true;
                $('.exist-mgr-' + value.uid).fadeOut(500).fadeIn(500);
            }
        });

        if(isExist === false) {
            if($scope.managers.length < 5) {
                $scope.projMang = {};

                $scope.projMang.uid = newProjMgr.uid;
                $scope.projMang.id = newProjMgr.email;
                $scope.projMang.name = newProjMgr.name;
                $scope.managers.push($scope.projMang);
            }
            else {
                console.log("Cannot add more than 5 project managers");
            }
        }
        else {
            console.log("project manager: " + newProjMgr.name + " already exists");
        }
    }

    $scope.selectProjManager = function (newProjMgr) {
        checkProjMgr(newProjMgr);

        $scope.filteredProjManager = null;
        $scope.managers.projMgrNew = "";
    };

    $scope.removeProjMgr = function(idx) {
        $scope.managers[idx].isRemove = true;

        setTimeout(function() {
            $scope.managers.splice(idx, 1);
        }, 150);
    };

    $scope.$on("changeProjMgrEdit", function() {
        $scope.managers.projMgrNew = "";
    });

    mainFactory.getAllProjectDetail($stateParams.projectID)
        .then(function (data) {
            $scope.project = data.item;
            var ipt_record = $scope.project.IPT_record;
            if(ipt_record!== undefined && ipt_record.indexOf("IPT")>0)
            {
                $scope.project.IPT_record=ipt_record.substr(ipt_record.indexOf("IPT"));
            }
            else if(ipt_record!== undefined && ipt_record.indexOf("ipt")>0)
            {
                $scope.project.IPT_record=ipt_record.substr(ipt_record.indexOf("ipt"));
            }
            else{
                $scope.project.IPT_record = undefined;
            }
            //show names of tech leads and project managers
            $scope.leads = ($scope.project.technical_leads !== undefined && $scope.project.technical_leads.length>0) ? $scope.project.technical_leads : [];
            $scope.managers = ($scope.project.project_managers !== undefined && $scope.project.project_managers.length>0) ? $scope.project.project_managers : [];

            //show date in user readable format
            $scope.project.deliverable.agreed = ($scope.project.deliverable !== undefined) ? $filter('date')(new Date($scope.project.deliverable.agreed), 'yyyy-MM-dd') : undefined;
            $scope.project.deliverable.estimate = ($scope.project.deliverable !== undefined) ? $filter('date')(new Date($scope.project.deliverable.estimate), 'yyyy-MM-dd') : undefined;
            $scope.loaded = true;

        }, function (reason) {
            console.log("Failed because " + reason);
        });


    $scope.cancel = function () {
        $rootScope.$broadcast('cancelModal');
        $modalInstance.dismiss();
    };

    $scope.getProjectStatus = function () {
        $(".select-status-result").show();
    };

    $scope.selectProjectStatus = function (id) {
        $scope.project.status = $scope.status[id].name;
        $(".select-status-result").hide();
    };

    $scope.getProjectProcess = function () {
        $(".select-process-result").show();
    };

    $scope.selectProjectProcess = function (id) {
        $scope.project.process = $scope.process[id].name;
        $(".select-process-result").hide();
    };

    $scope.getProjectGeo = function () {
        $(".select-geo-result").show();
    };

    $scope.selectProjectGeo = function (id) {
        $scope.project.geo = $scope.geo[id].name;
        $(".select-geo-result").hide();
    };

    $scope.updateProject = function () {

        var proj_managers = $scope.managers;
        var tech_leads = $scope.leads;

        var project = {
            "name": $scope.project.name,
            "description": $scope.project.description,
            "status": $scope.project.status,
            "process": $scope.project.process,
            "geo": $scope.project.geo,
            "IPT_record": $scope.project.IPT_record,
            "project_link": $scope.project.project_link,
            "technical_leads": tech_leads,
            "project_managers": proj_managers,
            "deliverable": {
                "estimate": new Date($scope.project.deliverable.estimate).getTime() + ((23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000)),
                "agreed": new Date($scope.project.deliverable.agreed).getTime() + ((23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000))
            }
        };
        // update the project
        mainFactory.updateProject($scope.project._id, project)
            .then(function (data) {
                $rootScope.$broadcast('cancelModal');
                $modalInstance.dismiss();
                globalState.projectDetails.name = project.name;
                globalState.projectDetails.description = project.description;
                globalState.projectDetails.status = project.status;
                globalState.projectDetails.process = project.process;
                globalState.projectDetails.geo = project.geo;
                globalState.projectDetails.IPT_record = project.IPT_record;
                globalState.projectDetails.project_link = project.project_link;
                globalState.projectDetails.deliverable = project.deliverable;
                mainFactory.getAllProjectDetail($scope.project._id)
                    .then(function (data) {
                        globalState.projectDetails.project_managers = data.item.project_managers;
                        globalState.projectDetails.technical_leads = data.item.technical_leads;
                    }, function (reason) {
                        console.log("Failed because " + reason);
                    });
                // broadcast the changed values, so that the changed values can be shown on project details page.
                $rootScope.$broadcast('updateProjectDetails');
                console.log("here");
                $state.go("home.projects.detail", {'projectID': $scope.project._id});
            }, function (reason) {
                console.log("Failed because " + reason);
            });
    };

    $scope.$on('closeProjectEditModal', function () {
        //close the modal and redirect the user to login page
        $modalInstance.dismiss();
        $cookies.remove('myToken');
        $cookies.remove('myID');
        $cookies.remove('myName');
        $cookies.remove('myUserRole');
        $state.go("login");
    });
});
