/**
 * Created by Xunrong Li on 6/11/15.
 * This service is used to show current View for navigation
 */

ResrcUtilApp.factory("globalState", function ($rootScope) {
    var exports = {};
    
    exports.currentView = {};
    exports.isProjectDetailView = {};
    exports.isSkillDetailView = {};
    exports.isProfileDetailView = {};

    exports.skillColorMapping = {};
    exports.projectColorMapping = {};
    
    exports.availableColors = [];
    exports.projects = [];

    exports.currentUtil = [];

    //use for modal search controller and profile view controller to communicate
    exports.userProfile = {};
    exports.tmpUserProfile = {};

    exports.profileDataLoaded = {};

    //use for settings view controller to communicate
    exports.categoryColorMapping = {};

    //user for EditModalCtrl.js and ModalSearchSkillCtrl.js to communicate
    exports.ownedSkills = [];
    exports.validation = true;

    //user for EditModalCtrl.js and UpdateProjectCtrl.js to communicate
    exports.tmpPerson = [];

    // store the node which are not in treemap
    exports.nodesNotInTreeMap={};

    // store the node which are not in treemap
    exports.nodesNotInBubbleChart={};

    //For communication between projDetailsCtrl.js and editProjectDetailsCtrl.js
    exports.projectDetails={};

    //store the projects filter value
    exports.projectsFilter={};
    exports.projectsFilter.name="Today";
    exports.projectsFilter.value="today";

    //store projectID
    exports.projectID="";

    exports.prevSkillNode = "";

    //placeholder for skills in bubble chart
    exports.filteredBubbleData = [];
    exports.isDetail = false;
    exports.skillView = '';

    //profile view variables
    exports.fromProfile = false;

    return exports;
});
