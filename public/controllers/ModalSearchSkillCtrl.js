/**
 * Created by Xunrong Li on 8/13/15.
 * Controller for search, select, add and remove skills
 */

ResrcUtilApp.controller("SearchSkillsController", function ($scope, $filter, globalState, mainFactory, SKILL_COLORS, $q) {
    $scope.isReadonly = true;
    // $scope.hasSkills = true;

    function isDuplicate(id) {
        return function (element) {
            return element._id !== id;
        };
    }

    //get skills for searching skills
    mainFactory.getSkills()
        .then(function (data) {
            // if(data.length === 0) {
            //     $scope.hasSkills = false;
            // }

            //exclude the skills that already owned by this user
            //Todo: use promise or $watch to make sure the get the $scope.ownedSkills from EditModalController
            if (globalState.userProfile.hasOwnProperty('skills')) {
                if (!$scope.ownedSkills) {
                    $scope.ownedSkills = globalState.userProfile.skills.slice();
                }

                //sort ownedSkills to be displayed in search skills modal
                $scope.ownedSkills = $scope.ownedSkills.sort($filter('predicatBy')("name"));

                var ownedSkills = $scope.ownedSkills;
                for (var i = 0; i < ownedSkills.length; i++) {

                    //add a new field called currentProficiency for the ng-model in the rating
                    $scope.ownedSkills[i].currentProficiency = {
                        rating: ownedSkills[i].proficiency[0].rating,
                        date: ownedSkills[i].proficiency[0].date
                    };

                    // replace code commented out code above due to jshint complains on annoymous function inside a loop
                    var id = ownedSkills[i].id;
                    data = data.filter(isDuplicate(id));
                }



                $scope.colorMapping = globalState.skillColorMapping;
                globalState.ownedSkills = $scope.ownedSkills;
            }
            else {
                $scope.ownedSkills = [];
                console.log('SearchSkillsController getSkills: ' + globalState.userProfile._id + ' does not currently have skills(allSkills contain all skills).');
            }
            $scope.allSkills = data.sort($filter('predicatBy')("name"));



        }, function (reason) {
        });

    $scope.getSkillsList = function () {
        if($scope.allSkills && $scope.allSkills.length > 0) {
            var key = angular.lowercase($scope.querySkill);
            //search the skill name
            $scope.filteredSkills = $filter('filter')($scope.allSkills, function (value, index, array) {
                return angular.lowercase(value.name).indexOf(key || '') !== -1;
            });

            //assign the colors to skills without color
            $scope.filteredSkills.forEach(function (elem, index, array) {
                if (elem.category_id) {
                    if (!globalState.skillColorMapping[elem.category_id]) {
                        globalState.skillColorMapping[elem.category_id] = getRandomColors();
                    }
                }
            });
            $scope.colorMapping = globalState.skillColorMapping;
        }
    };

    //watch the search input
    $scope.$watch("querySkill", function (newValue, oldValue) {
        if (newValue !== undefined) {
            if (newValue.length > 0) {
                $scope.getSkillsList();
            }
        }
    });

    $scope.clearSearchData = function () {
        $scope.querySkill = "";
        $scope.filteredSkills = [];
    };

    $scope.getAllSkills = function () {
        $scope.filteredSkills = $scope.allSkills;
        $scope.getSkillsList();
    };

    $scope.getFilteredSkills = function() {
        $scope.filteredSkills = $scope.allSkills;
    };

    //select skill from the search result
    //Note: could not use $index of ngRepeat since index is just the iterator
    $scope.selectSkill = function (id) {
        //get the skill that user click
        var selectedSkill = $filter('filter')($scope.allSkills, function (value, index, array) {
            // if (value._id == id) {
            // return value._id;
            return value._id == id;
            // }
        });

        // var result = $scope.allSkills.filter(function(value) {
        //     return value._id == id;
        // });
        // console.log(result[0].name);

        //format the skill json object
        var date = new Date();
        $scope.selectedSkill = {
            id: selectedSkill[0]._id,
            name: selectedSkill[0].name,
            category_id: selectedSkill[0].category_id,
            category: selectedSkill[0].category,
            proficiency: [],
            currentProficiency: {
                rating: 0,
                date: date.getTime()
            }
        };

        //testing using get single skill API
        // console.log(id);
        // mainFactory.getSkillDetails(id)
        //     .then(function (data) {
        //         console.log(data.item.name);
        //     }, function (reason) {
        //     });

        //set the rating to be clickable
        $scope.isReadonly = false;

        //clean search data
        $scope.querySkill = "";
        $scope.filteredSkills = [];
    };

    $scope.$on("editUserSkill", function (event) {
        if ($scope.selectedSkill !== undefined) {
            $scope.addSkill();
        }
    });

    //add skills when user clicks the plus button
    $scope.addSkill = function () {
        // console.log('Adding ' + $scope.selectedSkill.name);
        $scope.showerrorMessage = false;
        
        if ($scope.selectedSkill) {
            //remove the selected skills from search result
            $scope.allSkills = $filter('filter')($scope.allSkills, function (value, index, array) {
                if (value._id === $scope.selectedSkill.id) {
                    $scope.selectedSkillCopy=value;
                }
                return value._id !== $scope.selectedSkill.id;
            });

            if ($scope.selectedSkill.currentProficiency.rating > 0) {
                $scope.ownedSkills.unshift($scope.selectedSkill);

                $scope.isReadonly = true;

                //clean selection data
                $scope.selectedSkill = null;

                globalState.ownedSkills = $scope.ownedSkills;
            }
            else {
                console.log('show error');

                $scope.showerrorMessage = true;
                globalState.validation = false;
            }

        }
        else {
            console.log('Skill not selected');
        }
    };

    $scope.checkRating = function () {
        if ($scope.selectedSkill.currentProficiency.rating > 0) {
            $scope.showerrorMessage = false;
        }
        else {
            $scope.showerrorMessage = true;
        }
    };

    //remove skills when user clicks the minus button
    $scope.removeSkill = function (index) {
        $scope.ownedSkills.splice(index, 1);
        console.log("removing skill....");
    };

    function getRandomColors() {
        return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }

    $('[data-toggle="tooltip"]').tooltip();
});
