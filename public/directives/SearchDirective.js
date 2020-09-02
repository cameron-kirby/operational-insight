/**
 * Created by Xunrong Li on 8/3/15.
 * Directive for search bar
 */
ResrcUtilApp.directive('searchBar', function ($timeout, $filter, $cookies, globalState, mainFactory, $mdSidenav) {
    return {
        restrict: "EA",
        controller: "SearchController",
        link: function (scope, element, attrs) {
            scope.clickSearch = function () {
                scope.search = !scope.search;
                scope.showMoreClicked = false;
                scope.limitNum = 2;

                scope.isOpen = function() { return $mdSidenav('right').isOpen(); };
                if (scope.isOpen) {
                  $mdSidenav('menu').close();
                }

                if (scope.search) {
                    //set focus to the input field after clicking the icon
                    $timeout(function () {
                        element.children('input').focus();
                    }, 500);
                }
            };
        }
    };
});
