/**
 * Created by Xunrong Li on 8/4/15.
 * Directive for detecting clicking somewhere else
 */
ResrcUtilApp.directive('clickOff', function($parse, $document, $rootScope) {
    return {
        restrict: "A",
        compile: function($element, attr) {
            // Parse the expression to be executed
            // whenever someone clicks _off_ this element.
            var fn = $parse(attr.clickOff);
            return function(scope, element, attr) {
                // add a click handler to the element that
                // stops the event propagation.
                element.bind("click", function(event) {
                    event.stopPropagation();
                });
                angular.element($document[0].body).bind("click", function(event) {
                    scope.$apply(function() {
                        fn(scope, {$event:event});
                    });

                    //click off for search bar on the navbar
                    if(scope.query) {
                        scope.query = "";
                        scope.filteredPeople = "";
                        scope.filteredProjects = "";
                        scope.search = false;
                    }

                    //click off for floating button
                    if(scope.currentView && scope.currentView.toggle == "open") {
                        scope.currentView.toggle = "closed";
                        scope.isOverlay = !scope.isOverlay;
                    }

                    ////click off for edit skill search
                    //if(scope.filteredSkills) {
                    //    //clean search data
                    //    scope.clearSearchData();
                    //}

                    //click off for settings
                    if(scope.filteredPeopleRole) {
                        //clean search data
                        scope.clearPeopleFilter();
                        // scope.filterPeople = "";
                    }
                    //clear add category name
                    // if(scope.categoryName) {
                    //     scope.categoryName = "";
                    // }
                    // //clear add category description
                    // if(scope.categoryDesc) {
                    //     scope.categoryDesc = "";
                    // }

                    // if(scope.addProjAttrs) {
                    //     scope.addProjAttrs = "";
                    // }
                    
                    var result = document.getElementsByClassName("search-result");
                    var container = angular.element(result);

                    var target = angular.element(event.target);

                    if (target[0].id !== "project-search-terms" && !target.hasClass('search-result-item') && !target.hasClass('project-name') && !target.hasClass('show-filtered-skills')) {
                        $(".search-result").hide();
                    }

                    if (target[0].id !== "job-role-search") {
                        $(".search-jobrole-result").hide();
                    }

                    if (target[0].id !== "add-manager-search") {
                        $('.add-manager-search-results').hide();
                    }

                    if (target[0].id !== "manager-search-" + scope.$index) {
                        $(".manager-search-results-" + scope.$index).hide();
                    }

                    if (target[0].id !== "work-type-search") {
                        $(".search-worktype-result").hide();
                    }
                    
                    //click off for edit skill search
                    if(scope.filteredSkills) {
                        //clean search data
                        if(target[0].id !== "search-terms") {
                            scope.clearSearchData();
                        }
                    }

                    //add project dropdowns
                    if (target[0].id !== "addProjectStatus") {
                        $(".select-status-result").hide();
                    }

                    if (target[0].id !== "projectProcess") {
                        $(".select-process-result").hide();
                    }

                    if (target[0].id !== "projectGeo") {
                        $(".select-geo-result").hide();
                    }

                    if (target[0].id !== "filterRange") {
                        $(".search-result-range-item").hide();
                    }
                    
                    // if (target[0].id !== "people-role-result") {
                    //     $("." + scope.person.uid).hide();
                    // }

                    if (target[0].id !== "search-result-group") {
                        $(".search-result-group").hide();
                    }
                    //settings component
                    if (target[0].id !== "category-menu") {
                        $(".category-menu").hide();
                    }

                    if (target[0].id !== "search-manager") {
                        $(".manager-search-results").hide();
                    }

                    if (target[0].id !== "filterPeople") {
                        if (scope.filterPeople) {
                            scope.selectPersonSelected = true;
                        }

                        $(".people-search-result").hide();
                    }

                    if (target[0].id !== "selectRole") {
                        $(".role-list").hide();
                    }

                    if (target[0].id !== "selectStatus") {
                        $(".status-list").hide();
                    }

                    if (target[0].id !== "job-role-search-" + scope.$index) {
                        scope.showme = false;
                    }

                    if (target[0].id !== "work-type-search-" + scope.$index) {
                        scope.showmewt = false;
                    }

                    //project list status filter
                    if (target[0].id !== "status-filter-list") {
                        $(".status-filter-list").hide();
                    }

                    //adding new project
                    if (target[0].id !== "selection-list-lead-new") {
                        $rootScope.$broadcast("changeLeadNew");
                    }

                    if (target[0].id !== "selection-list-mgr-new") {
                        $rootScope.$broadcast("changeProjMgrNew");
                    }

                    //editing project
                    if (target[0].id !== "selection-list-lead-edit") {
                        $rootScope.$broadcast("changeLeadEdit");
                    }

                    if (target[0].id !== "selection-list-mgr-edit") {
                        $rootScope.$broadcast("changeProjMgrEdit");
                    }

                    //people list
                    if (target[0].id !== "filter-list") {
                        $(".filter-list").hide();
                    } 
                });
            };
        }
    };
});
