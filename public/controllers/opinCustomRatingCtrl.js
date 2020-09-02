/**
 * Created by Caesar Cavales on 10/30/15.
 * Controller for 
 */

ResrcUtilApp.controller("opinCustomRatingController", function ($scope, $attrs) {
	var ngModelCtrl  = { $setViewValue: angular.noop };

	this.init = function(ngModelCtrl_) {
		ngModelCtrl = ngModelCtrl_;
		// ngModelCtrl.$render = this.render;

		ngModelCtrl.$formatters.push(function(value) {
			if (angular.isNumber(value) && value << 0 !== value) {
				value = Math.round(value);
			}

			return value;
		});
	};

	// array that holds skill proficiency information and value
    $scope.ratingLevels = [{
        "value": 1,
        "description": "Fundamental Awareness (basic knowledge)",
        "focus": false
    },{
        "value": 2,
        "description": "Novice (limited experience)",
        "focus": false
    },{
        "value": 3,
        "description": "Intermediate (practical application)",
        "focus": false
    },{
        "value": 4,
        "description": "Advanced (applied theory)",
        "focus": false
    },{
        "value": 5,
        "description": "Expert (recognized authority)",
        "focus": false
    }];

    //displays corresponding filled stars
  	function showStarRating() {
		$scope.ratingLevels.forEach(function (elem, index, array) {
        	if(index + 1 <= ngModelCtrl.$modelValue) {
                elem.focus = true;
            }
            else {
                elem.focus = false;
            }
        });
    }

    //change focus value to display filled star
    $scope.proficiencyHover = function(idx) {
        if(!$scope.readonly) {
            $scope.ratingLevels.forEach(function (elem, index, array) {
                if(index <= idx) {
                    elem.focus = true;
                }
                else {
                    elem.focus = false;
                }
            });
        }
    };

    //change focus value to display outlined star
    $scope.proficiencyClear = function() {
        if(!$scope.readonly) {
        	showStarRating();
        }
    };

    //fill star up to selected index
    $scope.selectProficiency = function(value) {
        if(!$scope.readonly) {
        	ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue === value ? 0 : value);
    		showStarRating();
        }
    };

    $scope.$watch(function(){
		return ngModelCtrl.$modelValue;
	}, function (newValue) {
	    showStarRating();
	});
});
