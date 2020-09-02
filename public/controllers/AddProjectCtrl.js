/**
 * Created by Jake Wernette on 9/14/15.
 * Controller for adding a new project
 */
ResrcUtilApp.controller('AddProjectController', function ($scope, $filter, $q, $state, globalState, mainFactory, preselectService) {

    $scope.errorMessage = '';
    $scope.new_project = {};
    $scope.loaded = true;

    $q.all([
        getStatus(),
        getGeo(),
        getProcess()
    ]).then(function (data) {
        $scope.status = data[0].sort($filter('predicatBy')("name"));
        $scope.geo = data[1].sort($filter('predicatBy')("name"));
        $scope.process = data[2].sort($filter('predicatBy')("name"));
        // checkLoaded();
    });

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
                console.log(reason);
                d.reject(reason);
            });
        return d.promise;
    }

    $scope.leads = [];
    $scope.techLead = {};

    $scope.managers = [];
    $scope.projMang = {};

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

    $scope.$on("changeLeadNew", function() {
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

    $scope.$on("changeProjMgrNew", function() {
        $scope.managers.projMgrNew = "";
    });

    $scope.addProject = function () {
        var agreed = new Date(angular.element(document.querySelector('#agreed-del')).val());
        var est = new Date(angular.element(document.querySelector('#est-del')).val());

        var new_project = {
            "name": $scope.new_project.name,
            "description": $scope.new_project.description,
            "status": $scope.new_project.status,
            "process": $scope.new_project.process,
            "geo": $scope.new_project.geo,
            "IPT_record": $scope.new_project.IPT_record,
            "project_link": $scope.new_project.project_link,
            "technical_leads": $scope.leads,
            "project_managers": $scope.managers,
            "deliverable": {
                "estimate": est.getTime(),
                "agreed": agreed.getTime()
            },
            "team": []
        };
        mainFactory.createProject(new_project)
            .then(function (data) {
                preselectService.addID(data.projID);
                preselectService.addName(new_project.name);
                preselectService.addProcess(data.process);
                preselectService.addStatus(data.status);
                $state.go("home.people.profile.edit.tab", {edit: 'Projects'});
            }, function (reason) {
                console.log("Failed because " + reason);
            });
    };

    $scope.getProjectStatus = function () {
        $(".select-status-result").show();
    };

    $scope.selectProjectStatus = function (id) {
        $scope.new_project.status = $scope.status[id].name;
        $(".select-status-result").hide();
    };

    $scope.getProjectProcess = function () {
        $(".select-process-result").show();
    };

    $scope.selectProjectProcess = function (id) {
        $scope.new_project.process = $scope.process[id].name;
        $(".select-process-result").hide();
    };

    $scope.getProjectGeo = function () {
        $(".select-geo-result").show();
    };

    $scope.selectProjectGeo = function (id) {
        $scope.new_project.geo = $scope.geo[id].name;
        $(".select-geo-result").hide();
    };
});
