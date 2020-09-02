/**
 * Created by Xunrong Li on 6/22/15.
 * Main factory to retrieve data
 * Lasted edited by Xunrong Li on 7/14/2015
 */

ResrcUtilApp.factory('mainFactory', function ($cookies, $q, $http, REST_URL, $state, $rootScope, $stateParams, utilities) {

    var exports = {};

    function cleanCookies() {
        $cookies.remove('myToken');
        $cookies.remove('myID');
        $cookies.remove('myName');
        $cookies.remove('myUserRole');
    }

    //get the list of users' vacation info
    exports.getListOutOfOffice = function (manager) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'users/?onVacation=true&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of vacation info");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the vacation info, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //get user profile
    exports.getUserProfile = function (userID) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'users/' + userID).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty user profile");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if ($state.current.name !== 'login') {
                    if (status == 401) {
                        cleanCookies();
                        $state.go("login");
                    }
                    else if (status == 403) {
                        $state.go($rootScope.previousState.name);
                    }
                }

                console.log("could not find the user, error status is " + status +
                    " the response content is " + data);
                deferred.reject(data);
            });
        return deferred.promise;
    };

    //get list of users
    exports.getUsers = function (limit, bookmark, role, manager) {
        var deferred = $q.defer();
        var bookString = '';
        var roleString = '';

        if (bookmark) {
            bookString = '&bookmark=' + bookmark;
        }

        if (role) {
            roleString = '&role=' + role;
        }

        $http.get(REST_URL.baseUrl + 'users?manager=' + manager + '&limit=' + limit + bookString + roleString).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all users");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    $rootScope.$broadcast('closeModal');
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all users, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //search list of users
    exports.searchUsers = function (limit, role, searchValue) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'users?manager=all&limit=' + limit + '&role=' + role + '&searchValue=' + searchValue).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all users");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    $rootScope.$broadcast('closeModal');
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all users, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //get the list of managers
    exports.getUsersManagers = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'managers').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of managers");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get list of user managers, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };
    
    /**
     * Call to validate the user's utilization.
     * 
     * @param {String} userId
     *    The id of the user whose utilization is being verified.
     * @param {String} token
     *    The user's log in token.
     * @returns {q.defer}
     *    The promise to return the verified utilization or an error.
     */
    exports.validateUserUtilization = function (userId, token) {
        var deferred = $q.defer();
        
        var url = REST_URL.baseUrl + 'users/' + userId + '/validateUtilization';
        if (token) {
          url += '?token=' + token;
        }
        
        $http.put(url)
          .success(function (data) {
            deferred.resolve(data);
        })
          .error(function (data, status) {
            console.log("could not validate user utilization, error status is " + status +
                        " the response content is " + data);
            deferred.reject(data);
        });
        return deferred.promise;
    };

    //get manager profile
    exports.getOneManager = function (managerID) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'managers/' + managerID).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of managers");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get manager " + managerID + ", error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getSkillDetails = function (skillID, manager) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'skills/' + skillID + '?relatedSkills=true&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all users with that skill");
                }
                deferred.resolve(data);

            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all users with this skill, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    exports.getUsersWithSkill = function (skillID, manager) {
        var deferred = $q.defer();

        //get a list of users who has that skill
        $http.get(REST_URL.baseUrl + 'users/?skill=' + skillID + '&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all users");
                }

                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of users with this skill, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    exports.validateUserExist = function (userID) {
        var deferred = $q.defer();

        //returns true/false if user exist or not in the DB
        $http.get(REST_URL.baseUrl + 'users/isExist/' + userID).
            success(function (data, status, headers, config) {
                deferred.resolve(data.isExist);
            }).
            error(function (data, status, headers, config) {
                console.log("could not validate user, error status is " + status +
                    " the response content is " + data);
                deferred.reject(data);
            });

        return deferred.promise;
    };

    exports.createProject = function (value) {
        var deferred = $q.defer();

        $http.post(REST_URL.baseUrl + 'projects/', {
            name: value.name,
            description: value.description,
            IPT_record: value.IPT_record,
            project_link: value.project_link,
            status: value.status,
            process: value.process,
            geo: value.geo,
            technical_leads: value.technical_leads,
            project_managers: value.project_managers,
            deliverable: value.deliverable,
            team: value.team
        }).success(function (data, status, headers, config) {
            if (data === null) {
                console.log("return empty project");
            }

            //parses the project ID and pass it to calling function as projData.projID
            var projData = {};
            var parser = document.createElement('a');
            var queries;

            parser.href = headers("location");
            queries = parser.href.split('/');
            projData.projID = queries[queries.length - 1];

            // deferred.resolve(data);
            deferred.resolve(projData);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the projects, error status is " + status + " the response content is " + data.message);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.updateProject = function (projectID, project) {
        var deferred = $q.defer();

        $http.put(REST_URL.baseUrl + 'projects/' + projectID, project).success(function (data, status, headers, config) {
            if (data === null) {
                console.log("return empty project");
            }
            console.log(data);
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $rootScope.$broadcast('closeProjectEditModal');
                    $state.go('login');
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the projects, error status is " + status + " the response content is " + data.message);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getAllProjects = function (range) {
        var deferred = $q.defer();
        var manager = utilities.syncManager($stateParams.manager);

        $http.get(REST_URL.baseUrl + 'projects?&offset=0&parts=(name,status,totalpeople,totalhours)&sort=UTIL_DESC&range=' + range + '&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty project");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the projects, error status is " + status + " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getProjectDetail = function (projectID, range, manager) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'projects/' + projectID + '?range=' + range + '&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty project");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    //close the Edit project Modal, incase it is open
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the project details, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getAllProjectDetail = function (projectID) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'projects/' + projectID).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty project");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the project details, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getSkills = function (manager) {
        var deferred = $q.defer();

        if (!manager) {
            manager = 'all';
        }

        //get a list of users who has that skill
        $http.get(REST_URL.baseUrl + 'skills?manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty skill list");
                }
                deferred.resolve(data.items);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    $rootScope.$broadcast('closeModal');
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of skills, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.updateUserSkills = function (userID, value) {
        var deferred = $q.defer();

        $http.put(REST_URL.baseUrl + 'users/' + userID, {skills: value}).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could update user skills, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.updateUserDetails = function (userID, value) {
        var deferred = $q.defer();
        $http.put(REST_URL.baseUrl + 'users/' + userID, {
            fname: value.fname,
            lname: value.lname,
            email: value.email,
            job_title: value.job_title,
            phone_number: value.phone_number,
            vacations: value.vacations,
            projects: value.projects,
            role: value.role,
            status: value.status,
            reports_to: value.reports_to
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            if (status == 401) {
                cleanCookies();
                $state.go("login");
            }
            else if (status == 403) {
                $state.go($rootScope.previousState.name);
            }
            else {
                console.log("could update user details, error status is " + status +
                    " the response content is " + data);
                deferred.reject(data);
            }
        });
        return deferred.promise;
    };

    exports.getDropdown = function (name) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'dropdown?filter=' + name).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty dropdown result list");
                }
                deferred.resolve(data.items);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $rootScope.$broadcast('closeProjectEditModal');
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else{
                    console.log("could not get the dropdown list, error status is " + status + " the response content is " + data);
                    deferred.reject(data);
                }

            });
        return deferred.promise;
    };

    exports.search = function (part,manager,query) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'search?parts=(' + part + ')&manager='+manager+'&query='+query).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty search result list");
                }
                deferred.resolve(data.items);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $rootScope.$broadcast('closeModal');
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of search result, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.getNews = function (limit) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'newsfeeds?' + '&offset=0&date=' + new Date().getTime()).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty news");
                }
                deferred.resolve(data.items);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the news feed, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    exports.searchFaces = function (q) {
        var deferred = $q.defer();

        $http.jsonp('//faces.tap.ibm.com/api/find/?threshold=0&limit=5&q=' + q + '&callback=JSON_CALLBACK')
            .success(function (response) {
                deferred.resolve(response);
            })
            .error(function (response) {
                deferred.reject(response);
            });

        return deferred.promise;
    };

    exports.getManagers = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'managers').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of managers");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the managers, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };


    //get list skill categories for settings component
    exports.getCategories = function (limit) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'admin/categories').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all categories");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all categories, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //adding a category in the settings component
    exports.addCategory = function (value) {
        var deferred = $q.defer();

        $http.post(REST_URL.baseUrl + 'admin/categories', {
            name: value.name,
            description: value.description
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not add category, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //editing category fields in the settings component
    exports.editCategory = function (value) {
        var deferred = $q.defer();

        $http.put(REST_URL.baseUrl + 'admin/categories/' + value.id, {
            name: value.name,
            description: value.description
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not update category, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //deleting a category in the settings component
    exports.deleteCategory = function (categoryID) {
        var deferred = $q.defer();

        $http.delete(REST_URL.baseUrl + 'admin/categories/' + categoryID).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not delete category, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //getting a skill under a category in the settings component
    exports.getCategoryList = function (manager) {
        var deferred = $q.defer();

        //var manager = $cookies.get('myManager');

        $http.get(REST_URL.baseUrl + 'skills?view=list&manager=' + manager).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all skills in category");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of skills under category, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //getting a skill under a category in the settings component
    exports.getCategorySkill = function (categoryID) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'skills?category=' + categoryID).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all skills in category");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of skills under category, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //adding a skill in the settings component
    exports.addSkill = function (value) {
        var deferred = $q.defer();

        $http.post(REST_URL.baseUrl + 'admin/skills', {
            name: value.name,
            description: value.description,
            category_id: value.category_id,
            trending: value.trending
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).error(function (data, status, headers, config) {
            if (status == 401) {
                cleanCookies();
                $state.go("login");
            }
            else if (status == 403) {
                $state.go($rootScope.previousState.name);
            }
            else {
                console.log("could not add category, error status is " + status +
                    " the response content is " + data.message);
                deferred.reject(data);
            }
        });

        return deferred.promise;
    };

    //deleting a skill in the settings component
    exports.deleteSkill = function (skillID) {
        var deferred = $q.defer();

        $http.delete(REST_URL.baseUrl + 'admin/skills/' + skillID).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not delete skill, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //updating a skill in the settings component
    exports.updateSkill = function (value) {
        var deferred = $q.defer();

        $http.put(REST_URL.baseUrl + 'admin/skills/' + value.id, {
            name: value.name,
            description: value.description,
            trending: value.trending
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not update skill, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //getting project status list in the settings component
    exports.getStatus = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'admin/projectstatus?limit=500').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all project status");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all project status, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //getting project process list in the settings component
    exports.getProcess = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'admin/projectprocess?limit=500').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all project process");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all project process, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //getting project geo list in the settings component
    exports.getGeo = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'admin/projectgeo?limit=500').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all project geo");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all project geo, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //getting project process role in the settings component
    exports.getRole = function () {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'admin/jobroles?limit=500').
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all project role");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all project role, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //udpate specific project status in the settings component
    exports.updateProjAttr = function (attr, value) {
        var deferred = $q.defer();

        $http.put(REST_URL.baseUrl + 'admin/' + attr + '/' + value.id, {
            name: value.name,
            description: value.description
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not update project status, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //adding a project status in the settings component
    exports.addProjectAttribute = function (projectTab, value) {
        var deferred = $q.defer();

        $http.post(REST_URL.baseUrl + 'admin/' + projectTab, {
            name: value.name,
            description: value.description
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not add projectstatus, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //deleting a project status in the settings component
    exports.deleteProjectAttribute = function (statusID, projectTab) {
        var deferred = $q.defer();

        $http.delete(REST_URL.baseUrl + 'admin/' + projectTab + '/' + statusID).
            success(function (data, status, headers, config) {
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not delete project status, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //adding a user in the settings component
    exports.addUser = function (value) {
        var deferred = $q.defer();

        $http.post(REST_URL.baseUrl + 'users/', {
            _id: value._id,
            employee_type: value.employee_type,
            job_title: value.job_role,
            status: value.status,
            role: value.role,
            reports_to: value.reports_to
        }).success(function (data, status, headers, config) {
            deferred.resolve(data);
        }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not add user, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };

    //user to delete user in the settings component
    exports.deleteUser = function (userID) {
        var deferred = $q.defer();

        $http.delete(REST_URL.baseUrl + 'admin/users/' + userID)
            .success(function (data, status) {
                deferred.resolve(data);
            }).
            error(function (data, status) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not delete user, error status is " + status +
                        " the response content is " + data.message);
                    deferred.reject(data);
                }
            });

        return deferred.promise;
    };
    
    /**
     * Finds a scheduled task by its id.
     * 
     * @param {String} taskId
     *    The id of the task requested.
     */
    exports.findScheduledTaskById = function (taskId) {
      var deferred = $q.defer();
      
      var url = REST_URL.baseUrl + 'scheduler/' + taskId;
      
      $http.get(url)
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function (data, status, headers, config) {
          console.log('could not get scheduled task, error status is ' + status +
              ' the response content is ' + data);
          deferred.reject(data);
        });
      return deferred.promise;
    };      
    

    //gets all utilizations from the UTILIZATIONS table with project records
    exports.getUtilizations = function (dateFilter, manager, limit, bookmark) {
        var deferred = $q.defer();

        var bookString = '';

        if (bookmark) {
            bookString = '&bookmark=' + bookmark;
        }

        $http.get(REST_URL.baseUrl + 'utilizations?year=' + dateFilter + '&manager=' + manager + '&limit=' + limit + bookString).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all utilizations");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get the list of all utilizations, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    //gets a user's utilization from the UTILIZATIONS DB
    exports.getUserUtilizations = function (dateFilter, userId) {
        var deferred = $q.defer();

        $http.get(REST_URL.baseUrl + 'utilizations/' + userId + '?year=' + dateFilter).
            success(function (data, status, headers, config) {
                if (data === null) {
                    console.log("return empty list of all utilizations");
                }
                deferred.resolve(data);
            }).
            error(function (data, status, headers, config) {
                if (status == 401) {
                    cleanCookies();
                    $state.go("login");
                }
                else if (status == 403) {
                    $state.go($rootScope.previousState.name);
                }
                else {
                    console.log("could not get user utilization, error status is " + status +
                        " the response content is " + data);
                    deferred.reject(data);
                }
            });
        return deferred.promise;
    };

    return exports;
});
