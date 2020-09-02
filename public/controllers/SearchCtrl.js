/**
 * Created by Xunrong Li on 8/3/15.
 */

ResrcUtilApp.controller('SearchController',
    function ($scope, mainFactory, $timeout, $filter, globalState, PROJECT_COLORS, SKILL_COLORS, $state, $cookies) {

        var defaultSearchResult = 2;
        $scope.search = false;
        //default number of the results (both people and projects) is 3
        $scope.limitNum = defaultSearchResult;
        $scope.showMoreClicked = false;

        //when user clicks "show more" button
        $scope.showMore = function () {
            var peopleNum = $scope.people.length,
                projectNum = $scope.projects.length,
                skillsNum = $scope.skills.length;

            $scope.limitNum = Math.max(peopleNum, projectNum, skillsNum);
            $scope.showMoreClicked = true;
        };

        $scope.$on('clearSearch', function (event, args) {
            $scope.search = false;
            $scope.query = "";
            $scope.allProjects = null;
            $scope.allPeople = null;
            $scope.allSkills = null;
            $scope.people = null;
            $scope.projects = null;
            $scope.skills = null;
            $scope.showMoreClicked = false;
            $scope.limitNum = defaultSearchResult;
        });

        //watch the search input
        $scope.$watch(function () {
            return $scope.query;
        }, function () {
            $scope.limitNum = 2;
            $scope.showMoreClicked = false;
            manager = $cookies.get('myManager');
            if ($scope.query) {
                mainFactory.search('projects,users,skills', manager, $scope.query).then(function (data) {
                    if (data) {
                        $scope.people = data.users;
                        $scope.projects = data.projects;
                        $scope.skills = data.skills;
                        //assign colors to projects
                        $scope.projects.forEach(function (elem, index, array) {
                            if (elem.proj_id) {
                                if (!globalState.projectColorMapping[elem.proj_id]) {
                                    globalState.projectColorMapping[elem.proj_id] = getRandomColors();
                                }
                            }
                        });
                        //assign colors to skills
                        $scope.skills.forEach(function (elem, index, array) {
                            if (elem.skill_id) {
                                if (!globalState.skillColorMapping[elem.category_id]) {
                                    globalState.skillColorMapping[elem.category_id] = getRandomSkillColors();
                                }
                            }
                        });
                        $scope.skillColorMapping = globalState.skillColorMapping;
                        $scope.colorMapping = globalState.projectColorMapping;
                    }
                }, function (reason) {
                    console.log("Failed because " + reason);
                });
            }


        });

        $scope.goToSkillDetail = function (id) {
            $state.go('home.skills.detail', {skillID: id, manager: manager});
        };

        $scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
            //clear search parameters
            $scope.query = "";
            $scope.people = null;
            $scope.projects = null;
            $scope.skills = null;
            $scope.showMoreClicked = false;
            $scope.search = false;
            $scope.limitNum = defaultSearchResult;
        });

        function getRandomColors() {
            return PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];
        }

        function getRandomSkillColors() {
            return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
        }
    });
