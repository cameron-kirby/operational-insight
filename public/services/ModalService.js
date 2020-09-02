/**
 * Created by Xunrong Li on 8/21/15.
 * Modal Service - open modal when entering home.people.profile.edit state
 * Added open modal for settings confirmation view
 */

ResrcUtilApp.factory('ModalFactory', function($modal, $state, globalState) {
    var exports = {};
    exports.open = function(user) {
        var modalInstance = $modal.open({
            templateUrl: "views/editProfile.html",
            controller: 'ModalController',
            windowClass: 'modal-wide'
        });
        modalInstance.result.finally(function () {
            $state.go('home.people.profile', {userID: user});
        });
    };

    exports.openProjectDetails = function(project) {
        var modalInstance = $modal.open({
            templateUrl: "views/editProjectDetails.html",
            controller: 'ModalProjectController',
            windowClass: 'modal-wide'
        });
        modalInstance.result.finally(function () {
            if (globalState.fromProfile) {
                $state.go('home.projects.projectDetail', {projectID: project});
            }
            else {
                $state.go('home.projects.detail', {projectID: project});
            }
        });
    };

    exports.settingsConfirmAction = function(x) {
        var modalInstance = $modal.open({
            templateUrl: "views/confirmAction.html",
            controller: 'settingsModalCtrl',
            controllerAs: 'vm',
            backdrop: 'static',
            size: 'settings',
            resolve: {
                deleteField: function () { return x; }
            }
        });
        modalInstance.result.finally(function () {
            $state.go('home.settings');
        });
    };

    exports.editManager = function(user) {
        var modalInstance = $modal.open({
            templateUrl: "views/editManager.html",
            controller: 'editManagerModalCtrl',
            size: 'edit-manager',
            resolve: {
                user: function () { return user; }
            }
        });
        modalInstance.result.finally(function () {
            $state.go('home.people.profile', {userID: user._id});
        });
    };

    exports.switchTeams = function() {
        var modalInstance = $modal.open({
            templateUrl: "views/switchTeams.html",
            controller: 'switchTeamsModalCtrl',
            // backdrop: 'static',
            size: 'switch-team'
        });
        modalInstance.result.finally(function () {
            // $state.go('home.settings');
        });
    };

    return exports;
});
