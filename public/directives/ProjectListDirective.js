/**
 * Created by Xunrong Li on 7/16/15.
 * Directive for project list view on project panel on profile page
 */

ResrcUtilApp.directive('projectList', function (globalState, $timeout, $state, PROJECT_COLORS, $stateParams, $cookies, mainFactory) {
        return {
            restrict: "EA",
            controller: function ($scope) {
                if (!$scope.dataLoaded) {
                    return;
                }
            },
            link: function (scope, element, attrs) {
                var dateToday = new Date(),
                    currentYear = dateToday.getFullYear(),
                    myID = $cookies.get('myID');

                scope.yearFilter = currentYear;

                scope.personUtil = [];
                scope.sortType = "end_date";
                scope.sortReverse = false;

                var sortYearDesc = function(a, b) {
                    return b - a;
                };

                var getUtil = function(year, userId) {
                    mainFactory.getUserUtilizations(year, $stateParams.userID)
                        .then(function (data) {
                            scope.projects = data.items;
                            scope.yearFilters = data.pageInfo.yearFilters.sort(sortYearDesc);

                            getColors();
                        }, function (reason) {
                            console.log("Failed because " + reason);
                        });
                };

                var getColors = function() {
                    //use timeout to wait for the dom render
                    $timeout(function () {
                        $('.project-box div').each(function () {
                            var id = $(this).attr('id');
                            if (globalState.projectColorMapping[id]) {
                                $(this).css('background-color', globalState.projectColorMapping[id]);
                            } else {
                                var max = Math.floor(PROJECT_COLORS.length);
                                var min = Math.ceil(0);
                                globalState.projectColorMapping[id] = PROJECT_COLORS[Math.floor(Math.random() * (max - min + 1)) + min];
                                $(this).css('background-color', globalState.projectColorMapping[id]);
                            }
                        });

                        //ui-sref not work for tr element, use click event for navigation
                        $('.project-list').on('click', 'tr.project-list-row', function () {
                            var id = $(this).attr('id'),
                                filter = $stateParams.filter;

                            if(filter===undefined) {
                                $stateParams.filter='today';
                                globalState.projectsFilter.value='today';
                                globalState.projectsFilter.name='Today';
                            }

                            var myManager = $cookies.get("myManager");
                            globalState.fromProfile = true;
                            $state.go("home.projects.projectDetail", {projectID: id, filter:'today', manager: myManager});
                        });
                    });
                };

                scope.showYearFilter = function() {
                    $(".filter-list").show();
                };

                scope.applyYearFilter = function(year) {
                    scope.yearFilter = year;
                    getUtil(year, myID);
                };

                getUtil(scope.yearFilter, myID);

                scope.$on('redrawChart', function(event) {
                    getUtil(scope.yearFilter, myID);
                });
            }
        };
    });
