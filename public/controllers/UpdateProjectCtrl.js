/**
 * Created by Jake Wernette on 9/11/15.
 * Controller for updating detail modal
 */
ResrcUtilApp.controller('UpdateProjectController', function ($scope, $filter, $state, globalState, mainFactory, preselectService, $q, $cookies, $timeout, $rootScope, utilities) {
    $scope.tmpPerson = angular.copy(globalState.userProfile.projects);
    globalState.tmpPerson = angular.copy($scope.tmpPerson);

    var dateToday = new Date();

    $scope.yearFilter = dateToday.getFullYear();
    $scope.sortType = "start_date";
    $scope.sortReverse = false;
    $scope.newUtils = [];
    $scope.fromPreselectService = false;

    //why do we need this?
    $scope.$on('cancelModal', function () {
        getUtil($scope.yearFilter);
    });

    $q.all([
        fetchJobRoles(),
        fetchWorkTypes(),
        fetchProjects()
    ]).then(function (data) {
        setVariables();
        $scope.allJobRoles = data[0].sort($filter('predicatBy')("name"));
        $scope.allWorkTypes = data[1].sort($filter('predicatBy')("name"));
        $scope.allProjects = data[2].sort($filter('predicatBy')("name"));
        $scope.filteredProjects = angular.copy($scope.allProjects);
        setDefaults();
    });

    getUtil($scope.yearFilter);

    function sortDesc(a, b) {
        return b - a;
    }

    function getUtil(year) {
        var apiStartDate = Math.round(new Date(year, 0, 1).getTime()),
            apiEndDate = Math.round(new Date(year, 11, 31).getTime()),
            yearFilterBuff = [];

        //get user utilization filtered by year from the global user object
        $scope.personUtil = [];
        angular.forEach($scope.tmpPerson, function (proj, proj_key) {
            angular.forEach(proj.utilization, function (util, key) {
                var d = new Date(util.start_date);

                yearFilterBuff = yearFilterBuff.concat(utilities.getAllYearsBetween(util.start_date, util.end_date));

                util.name = proj.name;
                util.proj_id = proj.proj_id;
                util.daterange = $filter('date')(util.start_date, 'MM/dd/yy') + ' - ' + $filter('date')(util.end_date, 'MM/dd/yy');
                util.ref = key;
                util.isEdit = false;

                if ((util.start_date <= apiEndDate) && (util.end_date >= apiStartDate)) {
                    $scope.personUtil.push(util);
                }
            });
        });

        //adding this year even if you don't have any utils
        yearFilterBuff.push(new Date().getFullYear());

        //remove year filter duplicates
        $scope.yearFilters = yearFilterBuff.filter(function (elem, pos) {
            return yearFilterBuff.indexOf(elem) == pos;
        });

        //sort year filters in descending order
        $scope.yearFilters.sort(sortDesc);
    }

    $scope.showYearFilter = function () {
        $(".filter-list").show();
    };

    $scope.changeShow = function (ref, proj_id) {
        angular.forEach($scope.personUtil, function(util, util_key) {
            if (util.ref == ref && util.proj_id == proj_id) {
                util.isEdit = !util.isEdit;
            }
            else {
                util.isEdit = false;
            }
        });
    };

    $scope.applyYearFilter = function (year) {
        $scope.yearFilter = year;
        getUtil(year);
    };

    // This call needs to have all of the project information.
    // If we must change it to include every project than we must still kepp all of the information
    $scope.selectProject = function (id) {
        //get the project that user click
        $scope.selectedProject = $filter('filter')($scope.filteredProjects, function (value, index, array) {
            return value.proj_id === id;
        });
        if ($scope.selectedProject.length > 0) {
            $scope.queryProject = $scope.selectedProject[0].name;
            $scope.queryProjectCopy = $scope.queryProject;
        }
        $scope.filteredProjects = [];
        $("#search-result-project").hide();
    };

    //if new project is created, select this project
    if (preselectService.getID()) {
        $scope.fromPreselectService = true;
        $scope.selectedProject = [];
        $scope.selectedProject[0] = {};
        $scope.selectedProject[0].proj_id = preselectService.getID();
        $scope.selectedProject[0].name = preselectService.getName();
        $scope.selectedProject[0].process = preselectService.getProcess();
        $scope.selectedProject[0].status = preselectService.getStatus();
        $scope.queryProject = $scope.selectedProject[0].name;
    }

    function fetchProjects() {
        var d = $q.defer();

        mainFactory.getDropdown("projects")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function fetchJobRoles() {
        var d = $q.defer();

        mainFactory.getDropdown("jobroles")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    function fetchWorkTypes() {
        var d = $q.defer();

        mainFactory.getDropdown("projectstatus")
            .then(function (data) {
                d.resolve(data);
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        return d.promise;
    }

    //watch the search input
    $scope.$watch(function () {
        return $scope.queryProject;
    }, function () {
        if ($scope.queryProject && ($scope.queryProject != $scope.queryProjectCopy)) {
            if (!$scope.fromPreselectService) {
              //search the project name
              mainFactory.search("projects", 'all', $scope.queryProject)
                .then(function (data) {
                  $scope.filteredProjects = data.projects.sort($filter('predicatBy')("name"));
                  $(".search-result").show();
                }, function (reason) {
                  console.log("Failed because " + reason);
                });
            }
        } else {
          $scope.filteredProjects = $scope.allProjects;
        }
    });

    function setVariables() {
        if (preselectService.getStartDate() && preselectService.getEndDate()) {
            $scope.projectDates = preselectService.getDates();
        }

        if (preselectService.getComponent()) {
            $scope.projectComponent = preselectService.getComponent();
        }
        else {
            $scope.projectComponent = "";
        }

        if (preselectService.getUtil()) {
            $scope.rangeSlider = preselectService.getUtil();
        }
        else {
            $scope.rangeSlider = 0;
        }
    }

    function setDefaults() {
        if (preselectService.getRole()) {
            $scope.queryJobRole = preselectService.getRole();
        }
        else {
            var hasDeveloper = false;

            if ($scope.allJobRoles && $scope.allJobRoles.length > 0) {
                angular.forEach($scope.allJobRoles, function (jobRole, key) {
                    if (angular.lowercase(jobRole.name) == "developer") {
                        $scope.queryJobRole = jobRole.name;
                        hasDeveloper = true;
                    }
                });

                if (!hasDeveloper) {
                    $scope.queryJobRole = $scope.allJobRoles[0].name;
                }
            }
        }

        if (preselectService.getType()) {
            $scope.queryWorkType = preselectService.getType();
        }
        else {
            var hasActiveNewDev = false;
            // $scope.queryWorkType = "Active New Development";
            if ($scope.allWorkTypes && $scope.allWorkTypes.length > 0) {
                // $scope.queryWorkType = $scope.allWorkTypes[0].name;
                angular.forEach($scope.allWorkTypes, function (workType, key) {
                    if (angular.lowercase(workType.name) == "active new development") {
                        $scope.queryWorkType = workType.name;
                        hasActiveNewDev = true;
                    }
                });

                if (!hasActiveNewDev) {
                    $scope.queryWorkType = $scope.allWorkTypes[0].name;
                }
            }
        }
    }

    if (preselectService.getProjects().length > 0) {
        $scope.tmpPerson = preselectService.getProjects();
        $scope.fromPreselectService = true;
        getUtil($scope.yearFilter);
    }

    $scope.showProjects = function () {
        $(".search-result").show();
    };

    // $scope.queryWorkType = "Active New Development";
    $scope.getWorkTypes = function () {
        $(".search-worktype-result").show();
        $scope.workTypes = $scope.allWorkTypes;
    };

    $scope.selectWorkType = function (id) {
        //get the worktype that user click
        $scope.selectedWorkType = $filter('filter')($scope.allWorkTypes, function (value, index, array) {
            return value._id === id;
        });
        $scope.queryWorkType = $scope.selectedWorkType[0].name;
        $scope.workTypes = [];
    };

    // $scope.queryJobRole = "Developer";
    $scope.getJobRoles = function () {
        $scope.jobRoles = $scope.allJobRoles;
        $(".search-jobrole-result").show();
    };

    $scope.selectJobRole = function (id) {
        //get the jobrole that user click
        $scope.selectedJobRole = $filter('filter')($scope.allJobRoles, function (value, index, array) {
            return value._id === id;
        });
        $scope.queryJobRole = $scope.selectedJobRole[0].name;
        $scope.jobRoles = [];
    };

    $scope.$on("editUserProject", function (event) {
        var apiStartDate = Math.round(new Date($scope.yearFilter, 0, 1).getTime()),
            apiEndDate = Math.round(new Date($scope.yearFilter, 11, 31).getTime()),
            projArray = [],
            project_dates = angular.element(document.querySelector('#project-dates'));

        //check if any of the edit user project fields are populated
        if ((project_dates.data('start-date') !== undefined && project_dates.data('end-date') !== undefined) || ($scope.queryProject !== undefined && $scope.queryProject !== "") || (parseInt($scope.rangeSlider) !== 0 && $scope.rangeSlider !== undefined)) {
            $scope.addProject();
        }
        else {
            globalState.validation = true;
        }

        angular.forEach($scope.tmpPerson, function (proj, projIdx) {
            var project = {
                name: proj.name,
                process: proj.process,
                proj_id: proj.proj_id,
                status: proj.status,
                utilization: []
            };

            //delete utilizations that are active on the filtered year
            var projUtil = proj.utilization.filter(function (elem, pos) {
                return !((elem.start_date <= apiEndDate) && (elem.end_date >= apiStartDate));
            });

            project.utilization = projUtil;

            //chage personUtil(this is your records from the DB)
            angular.forEach($scope.personUtil, function (util, utilIdx) {
                if (util.proj_id === proj.proj_id) {
                    var new_util = {
                        end_date: util.end_date,
                        job_role: util.job_role,
                        percentage: parseInt(util.percentage),
                        start_date: util.start_date,
                        work_type: util.work_type,
                        component: (util.component === '' || util.component === undefined) ? '' : util.component
                    };
                    project.utilization.push(new_util);
                }
            });

            projArray.push(project);
        });

        $scope.tmpPerson = angular.copy(projArray);
        globalState.tmpPerson = $scope.tmpPerson;
    });


    $scope.editUtil = function (index, ref, proj_id) {
        var orderBy = $filter('orderBy'),
            util_changed = [],
            dateRange = angular.element(document.querySelector('#date-range-' + proj_id + '-' + index));
            newProjectObj = [];

        $scope.personUtil = orderBy($scope.personUtil, $scope.sortType, $scope.sortReverse);

        for (i = 0; i < $scope.personUtil.length; i++) {
            if ($scope.personUtil[i].ref == ref) {
                util_changed = $scope.personUtil[i];
            }
        }

        $scope.selectedProject = $filter('filter')($scope.tmpPerson, function (value, index, array) {
            return value.proj_id === proj_id;
        });

        newProjectObj = {
            proj_id: util_changed.proj_id,
            percentage: parseInt(util_changed.percentage),
            start_date: new Date(dateRange.data('start-date')).getTime(),
            end_date: new Date(dateRange.data('end-date')).getTime(),
            component: util_changed.component,
            job_role: util_changed.job_role,
            work_type: util_changed.work_type
        };

        $scope.removeProject(ref, proj_id);
        modifyUtilList(newProjectObj);
        getUtil($scope.yearFilter);

        //find utilization edited and set edit flag to true
        for (i = 0; i < $scope.personUtil.length; i++) {
            if (($scope.personUtil[i].proj_id == newProjectObj.proj_id) &&
                ($scope.personUtil[i].start_date == newProjectObj.start_date) &&
                ($scope.personUtil[i].end_date == newProjectObj.end_date) &&
                ($scope.personUtil[i].component == newProjectObj.component) &&
                ($scope.personUtil[i].job_role == newProjectObj.job_role) &&
                ($scope.personUtil[i].work_type == newProjectObj.work_type)) {
                    $scope.personUtil[i].isEdit = true;

                    break;
                }
        }

        if ($scope.yearFilters.indexOf(newProjectObj.start_date) > 0) {
            $scope.yearFilters.push(newProjectObj.start_date);
        }
    };

    $scope.addProject = function () {
        $scope.projectDateError = false;
        $scope.selectedProjectError = false;
        $scope.rangeSliderError = false;
        $scope.selectedWorkTypeError = false;
        $scope.selectedJobRoleError = false;
        var start_date, end_date = null;

        if ($scope.fromPreselectService) {
          $scope.fromPreselectService = false;

          start_date = preselectService.getStartDate().getTime();
          end_date = preselectService.getEndDate().getTime();
        } else {
          var project_dates = angular.element(document.querySelector('#project-dates'));

          if (project_dates.data('start-date') === undefined || project_dates.data('end-date') === undefined) {
              $scope.projectDateError = true;
          } else {
              start_date = new Date(project_dates.data('start-date')).getTime();
              end_date = new Date(project_dates.data('end-date')).getTime();
          }
        }

        if ($scope.selectedProject === undefined || $scope.queryProject === "") {
            $scope.selectedProjectError = true;
        }

        if ($scope.queryWorkType === "" || !$scope.queryWorkType) {
            $scope.selectedWorkTypeError = true;
        }

        if ($scope.queryJobRole === "" || !$scope.queryJobRole) {
            $scope.selectedJobRoleError = true;
        }
        if (parseInt($scope.rangeSlider) === 0) {
            $scope.rangeSliderError = true;
        }

        if ($scope.projectDateError === false && $scope.selectedProjectError === false && $scope.rangeSliderError === false && $scope.selectedWorkTypeError === false && $scope.selectedJobRoleError === false) {
            preselectService.clearService();

            //chunk taken here
            var newProjectObj = {
                percentage: parseInt($scope.rangeSlider),
                start_date: start_date,
                end_date: end_date,
                component: ($scope.projectComponent === '' || $scope.projectComponent === undefined) ? undefined : $scope.projectComponent,
                job_role: $scope.queryJobRole,
                work_type: $scope.queryWorkType
            };

            modifyUtilList(newProjectObj);
            getUtil($scope.yearFilter);

            if ($scope.yearFilters.indexOf(start_date) > 0) {
                $scope.yearFilters.push(start_date);
            }

            //shows confirmation text
            $rootScope.utilConfirm = true;

            $timeout(function () {
                $rootScope.utilConfirm = false;
            }, 3000);

            $scope.rangeSlider = 0;
            $scope.queryProject = "";
            $scope.projectDates = "";
            if (project_dates) {
              project_dates.removeData('start-date');
              project_dates.removeData('end-date');
            }
            $scope.projectComponent = "";
            $scope.queryWorkType = "Active New Development";
            $scope.queryJobRole = "Developer";
            $('._720kb-datepicker-calendar-body').children().removeClass('_720kb-datepicker-active');
        }
        else {
            globalState.validation = false;
        }
      };

    function modifyUtilList(utilChange) {
        var hasProject = false;
        var project = '';

        $filter('filter')($scope.tmpPerson, function (value, index, array) {
            if (value.proj_id === $scope.selectedProject[0].proj_id) {
                hasProject = true;
                project = value;
            }
        });

        var new_util = {
            percentage: utilChange.percentage,
            start_date: utilChange.start_date,
            end_date: utilChange.end_date,
            component: utilChange.component,
            job_role: utilChange.job_role,
            work_type: utilChange.work_type
        };

        if (new_util.component === '') {
            new_util.component = undefined;
        }

        if (hasProject === true) {
            var utilization = [];

            utilization.push(new_util);

            var new_range = moment.range(utilChange.start_date, utilChange.end_date);

            angular.forEach(project.utilization, function (util, key) {
                var comp = util.component;

                if (util.component === '') {
                    comp = undefined;
                }

                if (util.work_type === new_util.work_type && util.job_role === new_util.job_role && comp === new_util.component) {
                    var start = util.start_date;
                    var end = util.end_date;
                    var range = moment.range(start, end);

                    if (new_range.overlaps(range)) {
                        var intersect = new_range.intersect(range);

                        if (new_range.isSame(range)) {
                            // destroy old
                        } else if (new_range.contains(range)) {
                            // destroy old
                        } else if (range.contains(new_range)) {
                            // split old range
                            var d = new Date(intersect.start.valueOf());
                            d.setDate(d.getDate() - 1);

                            var first_util = {
                                percentage: parseInt(util.percentage),
                                start_date: start,
                                end_date: d.getTime(),
                                component: util.component,
                                job_role: util.job_role,
                                work_type: util.work_type
                            };

                            if (intersect.start.valueOf() !== start) {
                                utilization.push(first_util);
                            }

                            var f = new Date(intersect.end.valueOf());
                            f.setDate(f.getDate() + 1);

                            var second_util = {
                                percentage: parseInt(util.percentage),
                                start_date: f.getTime(),
                                end_date: end,
                                component: util.component,
                                job_role: util.job_role,
                                work_type: util.work_type

                            };

                            if (intersect.end.valueOf() !== end) {
                                utilization.push(second_util);
                            }
                        } else if (new_range.start.isBefore(range.start)) {
                            var m = new Date(new_util.end_date);
                            m.setDate(m.getDate() + 1);

                            var new_before = {
                                percentage: parseInt(util.percentage),
                                start_date: m.getTime(),
                                end_date: end,
                                component: util.component,
                                job_role: util.job_role,
                                work_type: util.work_type
                            };
                            utilization.push(new_before);
                        } else {
                            var n = new Date(new_util.start_date);
                            n.setDate(n.getDate() - 1);

                            var old_before = {
                                percentage: parseInt(util.percentage),
                                start_date: start,
                                end_date: n.getTime(),
                                component: util.component,
                                job_role: util.job_role,
                                work_type: util.work_type
                            };

                            utilization.push(old_before);
                        }
                    } else {
                        var not_overlap = {
                            percentage: parseInt(util.percentage),
                            start_date: start,
                            end_date: end,
                            component: util.component,
                            job_role: util.job_role,
                            work_type: util.work_type
                        };

                        utilization.push(not_overlap);
                    }
                } else {
                    utilization.push(util);
                }
            });

            project.utilization = utilization;
        } else {
            //only passes here if adding new project
            var new_project = {
                name: $scope.selectedProject[0].name,
                status: $scope.selectedProject[0].status,
                proj_id: $scope.selectedProject[0].proj_id,
                process: $scope.selectedProject[0].process,
                utilization: [{
                    percentage: new_util.percentage,
                    start_date: new_util.start_date,
                    end_date: new_util.end_date,
                    component: new_util.component,
                    job_role: new_util.job_role,
                    work_type: new_util.work_type
                }]
            };
            $scope.tmpPerson.push(new_project);
        }
    }

    $scope.removeProject = function (ref, proj_id) {
        $filter('filter')($scope.tmpPerson, function (value, index, array) {
            if (value.proj_id === proj_id) {
                if (value.utilization.length > 1) {
                    value.utilization.splice(ref, 1);
                }
                else {
                    $scope.tmpPerson.splice(index, 1);
                }
            }
        });
        getUtil($scope.yearFilter);
    };

    $scope.gotoAddProject = function () {
        setPreselectService();
        $state.go("home.people.profile.edit.tab", {edit: 'AddProject'});
    };

    $scope.changeUtilDate = function () {
      $scope.fromPreselectService = false;
    };

    function setPreselectService() {
      var dateRange = angular.element(document.querySelector('#project-dates'));

      preselectService.addDates($scope.projectDates);
      preselectService.addStartDate(dateRange.data('start-date'));
      preselectService.addEndDate(dateRange.data('end-date'));
      preselectService.addComponent($scope.projectComponent);
      preselectService.addRole($scope.queryJobRole);
      preselectService.addType($scope.queryWorkType);
      preselectService.addUtil($scope.rangeSlider);
      preselectService.addProjects($scope.tmpPerson);
    }
});
