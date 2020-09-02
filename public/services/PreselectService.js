/**
 * Created by Jake Wernette on 10/13/15.
 * This service is used to pass data from new project to add project
 */

ResrcUtilApp.service('preselectService', function () {
    var projects = [];
    var projectId = '';
    var projectName = '';
    var projectDates = '';
    var projStartDate = '';
    var projEndDate = '';
    var projectComponent = '';
    var projectRole = '';
    var projectType = '';
    var projectUtil = '';
    var projectStatus = '';
    var projectProcess = '';


    var addID = function (id) {
        projectId = id;
    };

    var getID = function () {
        return projectId;
    };

    var addName = function (name) {
        projectName = name;
    };

    var getName = function () {
        return projectName;
    };

    var addDates = function (dates) {
        projectDates = dates;
    };

    var getDates = function () {
        return projectDates;
    };

    var addStartDate = function (date) {
        projStartDate = date;
    };

    var getStartDate = function () {
        return projStartDate;
    };

    var addEndDate = function (date) {
        projEndDate = date;
    };

    var getEndDate = function () {
        return projEndDate;
    };

    var addComponent = function (comp) {
        projectComponent = comp;
    };

    var getComponent = function () {
        return projectComponent;
    };

    var addRole = function (role) {
        projectRole = role;
    };

    var getRole = function () {
        return projectRole;
    };

    var addType = function (type) {
        projectType = type;
    };

    var getType = function () {
        return projectType;
    };

    var addUtil = function (util) {
        projectUtil = util;
    };

    var getUtil = function () {
        return projectUtil;
    };

    var addProjects = function (proj) {
        projects = angular.copy(proj);
    };

    var getProjects = function () {
        return projects;
    };

    var addStatus = function (status) {
        projectStatus = status;
    };

    var getStatus = function () {
        return projectStatus;
    };

    var addProcess = function (process) {
        projectProcess = process;
    };

    var getProcess = function () {
        return projectProcess;
    };

    var clearService = function () {
        projectId = '';
        projectDates = '';
        projStartDate = '';
        projEndDate = '';
        projectName = '';
        projectComponent = '';
        projectRole = '';
        projectType = '';
        projectUtil = '';
        projectStatus = '';
        projectProcess = '';
    };

    return {
        addID: addID,
        getID: getID,
        addName: addName,
        getName: getName,
        addDates: addDates,
        getDates: getDates,
        addStartDate: addStartDate,
        getStartDate: getStartDate,
        addEndDate: addEndDate,
        getEndDate: getEndDate,
        addComponent: addComponent,
        getComponent: getComponent,
        addRole: addRole,
        getRole: getRole,
        addType: addType,
        getType: getType,
        addUtil: addUtil,
        getUtil: getUtil,
        addProjects: addProjects,
        getProjects: getProjects,
        addStatus: addStatus,
        getStatus: getStatus,
        addProcess: addProcess,
        getProcess: getProcess,
        clearService: clearService
    };

});
