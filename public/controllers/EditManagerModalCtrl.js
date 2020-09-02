ResrcUtilApp.controller('editManagerModalCtrl', function ($scope, $rootScope, $modalInstance, $timeout, $filter, mainFactory, user, $cookies) {
  var backup = user.reports_to;

  $scope.isEditing = false;
  $scope.person = user;
  $scope.newManager = {};
  $scope.currentManager = $scope.person.reports_to;
  $scope.managerModel = '';
  $scope.changeMgr = false;

  getManagers();

  function checkManager() {
    var curMgr = '';
    $scope.changeMgr = false;

    if (backup !== "" && backup !== undefined) {
      curMgr = backup._id;
    }

    if ($scope.currentManager == "") {
      if (curMgr !== "") {
        $scope.changeMgr = true;
      }
    } else {
      if (curMgr !== $scope.currentManager._id) {
        $scope.changeMgr = true;
      }
    }
  }

  $scope.startManagerEditing = function () {
      $scope.isEditing = true;
      $scope.managerModel = '';
      $scope.currentManager = '';
      checkManager();

      $timeout(function() {
          $('.edit-manager-input').focus();
      });
  };

  function getManagers() {
      mainFactory.getManagers()
          .then(function (data) {
              $scope.managers = data.items;
          }, function (reason) {
              console.log("Failed because " + reason);
          });
  }

  $scope.openManagerDropdown = function (value) {
      var key = angular.lowercase(value);
      $scope.filteredManagers = $filter('filter')($scope.managers, key);
      $('.edit-manager-result').show();
  };

  $scope.selectManager = function (manager) {
      $scope.currentManager = manager;
      $scope.isEditing = false;

      checkManager();
      $('.edit-manager-result').hide();
  };

  $scope.cancelEdit = function () {
      $scope.person.reports_to = backup;
      $scope.currentManager = backup;
      $modalInstance.dismiss();
  };

  $scope.saveEdit = function (manager) {
    $scope.person.reports_to = manager;

    mainFactory.updateUserDetails($scope.person._id, $scope.person)
      .then(function (data) {
        if (manager._id == $cookies.get('myManager')) {
          $rootScope.$broadcast("updateVacation");
        }

        console.log("User updated");
      }, function (reason) {
        $scope.person.reports_to = backup;
        console.log("Failed because " + reason);
      });

    $modalInstance.dismiss();
  };
});
