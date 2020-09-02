/**
 * Created by harishyayi on 7/13/15.
 */
ResrcUtilApp.controller('AdminViewController', function ($scope,$http,$modal, $log, globalState) {

    globalState.currentView.name = "Admin";
    globalState.currentView.toggle = "closed";

    var config = {
        method: 'GET',
        url: 'http://localhost:8080/rest/v1/skills?offset=0'

    };
    $http(config)
        .success(function(data) {
            $scope.skills=data.items;
            //$scope.names = response;
        });

    console.log($scope);


});

