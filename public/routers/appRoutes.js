angular.module('appRoutes', ['ui.router'])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

        //add interceptor
        $httpProvider.interceptors.push('TokenInterceptor');

        // to remove trailing / and %2F
        $urlRouterProvider.rule(function ($injector, $location) {
            var path = $location.url();

            // check to see if the path has a trailing slash
            if ('/' === path[path.length - 1]) {
                return path.replace(/\/$/, '');
            }

            if (path.indexOf('%2F') >= 0) {
                return path.replace('%2F', '');
            }

            if (path.indexOf('/?') > 0) {
                return path.replace('/?', '?');
            }

            return false;
        });

        $urlRouterProvider.otherwise('/projects?filter=today&manager=all');
        $stateProvider
            .state('login', {
                url: '/login?nextState&action&userId&token',
                templateUrl: 'modules/login/Login.html',
                controller: 'LoginController',
                controllerAs: 'vm',
                access: {
                    requiredLogin: false
                },
                params: {
                  action: {
                    squash: true,
                    value: ''
                  },
                  nextState: {
                    squash: true,
                    value: ''
                  },
                  token: {
                    squash: true,
                    value: ''
                  },
                  userId: {
                    squash: true,
                    value: ''
                  }
                }
            })
            .state('home', {
                templateUrl: 'views/main.html',
                controller: 'MainController',
                access: {
                    requiredLogin: true
                }
            })
            .state('home.projects', {
                url: '/projects?filter&manager',
                views: {
                    'mapView': {
                        templateUrl: 'views/treeMap.html',
                        controller: 'TreeMapController'
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.projectlist', {
                url: '/projectlist?filter&manager',
                views: {
                    'mapView': {
                        templateUrl: 'views/projectList.html',
                        controller: "ProjectListController",
                        resolve: {
                            isProfileDetailView: function () {
                                return false;
                            }
                        }
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.projects.detail', {
                url: '/{projectID}',
                views: {
                    'detailView': {
                        templateUrl: 'views/projectDetails.html',
                        controller: 'ProjectDetailController'
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.projects.projectDetail', {
                url: '/projectdetail/{projectID}',
                views: {
                    'detailView': {
                        templateUrl: 'views/profileProjDetails.html',
                        controller: "profileProjDetailsController"
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.projects.projectDetail.edit', {
                url: '/edit',
                resolve: {
                    passState: function (ModalFactory, $stateParams) {
                        ModalFactory.openProjectDetails($stateParams.projectID);
                    }
                },
                access: {
                    requiredLogin: true
                }

            })
            .state('home.projects.detail.edit', {
                url: '/edit',
                resolve: {
                    passState: function (ModalFactory, $stateParams) {
                        ModalFactory.openProjectDetails($stateParams.projectID);
                    }
                },
                access: {
                    requiredLogin: true
                }

            })
            .state('home.skills', {
                url: '/skills?manager',
                reloadOnSearch: true,
                views: {
                    'mapView': {
                        templateUrl: 'views/bubbleChart.html',
                        controller: 'BubbleChartController',
                        controllerAs: 'vm'
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.skillsList', {
                url: '/skillsList?manager',
                reloadOnSearch: true,
                views: {
                    'mapView': {
                        templateUrl: 'modules/skillList/SkillList.html',
                        controller: 'SkillListController',
                        controllerAs: 'vm'
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.skills.detail', {
                url: '/{skillID}',
                views: {
                    'detailView': {
                        templateUrl: 'views/skillDetails.html',
                        controller: "SkillDetailController"
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.skills.skillDetail', {
                url: '/skilldetail/{skillID}',
                views: {
                    'detailView': {
                        templateUrl: 'views/profileSkillDetails.html',
                        controller: "ProfileSkillDetailController"
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.people', {
                url: '/people?manager',
                views: {
                    'mapView': {
                        templateUrl: 'views/cardView.html',
                        controller: "CardViewController",
                        resolve: {
                            isProfileDetailView: function () {
                                return false;
                            }
                        }
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.peoplelist', {
                url: '/peoplelist?manager',
                views: {
                    'mapView': {
                        templateUrl: 'views/peopleList.html',
                        controller: "PeopleListController"
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.people.profile', {
                url: "/{userID}?action",
                views: {
                    'detailView': {
                        templateUrl: 'modules/userProfile/UserProfile.html',
                        controller: 'UserProfileController',
                        controllerAs: 'profileVM',
                        resolve: {
                            isProfileDetailView: function () {
                                return true;
                            }
                        }
                    }
                },
                access: {
                    requiredLogin: true
                },
                params: {
                  action: {
                    squash: true,
                    value: ''
                  }
                }
            })
            .state('home.people.profile.edit', {
                url: '/edit',
                resolve: {
                    passState: function (ModalFactory, $stateParams) {
                        ModalFactory.open($stateParams.userID);
                    }
                },
                access: {
                    requiredLogin: true
                }
            })
            .state('home.people.profile.edit.tab', {
                url: '/{edit}',
                access: {
                    requiredLogin: true
                }
            })
            .state('home.settings', {
                url: '/settings',
                views: {
                    'mapView': {
                        templateUrl: 'views/settings.html',
                        controller: "SettingsController",
                        controllerAs: "vmSettings"
                    }
                },
                access: {
                    requiredLogin: true,
                    requiredAdmin: true
                }
            })
            .state('home.settings.confirm', {
                url: '/confirm',
                resolve: {
                    passState: function (ModalFactory) {
                        ModalFactory.settingsConfirmAction();
                    }
                },
                access: {
                    requiredLogin: true,
                    requiredAdmin: true
                }
            });
    });


ResrcUtilApp.run(function ($rootScope, $state, AuthenticationFactory, $cookies, $mdSidenav, $mdComponentRegistry, mainFactory) {
    // when the page refreshes, check if the user is already logged in
    AuthenticationFactory.check();

    $rootScope.opHistory = [];

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
        //if a user tries to access a required admin page and is not an admin, terminate state change
        if (toState.access.requiredAdmin && $cookies.get('myUserRole') !== "Admin") {
            console.log("Access to settings page denied");
            e.preventDefault();
        }

        if (toState.name === "login") {
            return; // no need to redirect
        }

        // now, redirect only not authenticated
        if ((toState.access && toState.access.requiredLogin) && !AuthenticationFactory.isLogged) {
            e.preventDefault(); // stop current execution
            $rootScope.storedState = toState;
            if (toParams) {
                $rootScope.storedParams = toParams;
            }
            $state.go('login'); // go to login
        }
    });

    //Always check this function whenever a new route is added to the project to make changes
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, globalState) {
        var modalString = "home.people.profile.edit.tab";
        var managers = [];

        function mapManagers(e) {
            return e._id;
        }

        setTimeout(function () {
          $mdComponentRegistry.when('menu').then(function(){
            if ($mdSidenav('menu').isOpen()) {
              $mdSidenav('menu').close();
            }
          });
        }, 0);

        if (fromParams.manager && toParams.manager && (fromParams.manager !== toParams.manager)) {
          $rootScope.$broadcast('updateVacation');
          $rootScope.$broadcast('clearSearch');

          mainFactory.getUsersManagers()
            .then(function (data) {
              managers = data.items;

              if (managers.map(mapManagers).indexOf(toParams.manager) !== -1) {
                $cookies.put('myTeam', managers[managers.map(mapManagers).indexOf(toParams.manager)].team);
                $rootScope.$broadcast('changeTeam');
              }
            }, function (reason) {
                console.log("Failed because " + reason);
            });
        }

        if (($rootScope.opHistory.length === 0 && toState.name === modalString) || ((fromState.name.indexOf('.edit') == -1 && toState.name.indexOf('.edit') == -1 && fromState.name !== "" && fromState.name !== "login" && !$rootScope.back))) {
            var state = {};

            state.name = fromState.name;
            state.params = fromParams;
            // do not push the previous state to opHistory if the previous state name is either home.projects or home.projectlist and if params.filter is undefined
            if (!((state.name === 'home.projects' || state.name === 'home.projectlist' || state.name === 'home.projects.detail') && state.params.filter === undefined)) {
                if (((state.name === 'home.projects.detail' && (state.params.projectID === "undefined" || state.params.projectID === undefined)) || (state.name === 'home.people.profile' && (state.params.userID === "undefined" || state.params.userID === undefined)) || (state.name === 'home.skills.detail' && (state.params.skillID === "undefined" || state.params.skillID === undefined)))) {
                    console.log('do nothing');
                }
                else {
                    var name = state.name;
                    var params = state.params;

                    if(fromState.name.indexOf('.edit') == -1 && toState.name.indexOf('.edit')==-1){
                        if (name === 'home.projects') {
                            state.backLabel = 'Projects';
                        } else if (name === 'home.projects.detail') {
                            state.backLabel = $rootScope.currentProject;
                        } else if (name === 'home.projects.projectDetail') {
                            state.backLabel = $rootScope.currentProject;
                        } else if (name === 'home.skills') {
                          if (params.view && params.view === 'list') {
                            state.backLabel  = 'Skills List';
                          } else {
                            state.backLabel  = 'Skills';
                          }
                        } else if (name === 'home.skills.detail') {
                            state.backLabel  = $rootScope.currentSkill;
                        } else if (name === 'home.skills.skillDetail') {
                            state.backLabel  = $rootScope.currentSkill;
                        } else if (name === 'home.people') {
                            state.backLabel  = 'People';
                        } else if (name === 'home.people.profile') {
                            state.backLabel  = $rootScope.currentProfileName;
                        } else if (name === 'home.projectlist') {
                            state.backLabel  = 'Project List';
                        } else if ((name === 'home.settings') && ($cookies.get('myUserRole') === 'Admin')) {
                            state.backLabel  = 'Settings';
                        } else if ((name === 'home.settings') && ($cookies.get('myUserRole') !== 'Admin')) {
                            state.backLabel  = 'Back';
                        } else if (name === 'home.peoplelist') {
                            state.backLabel = 'People List';
                        }

                        $rootScope.$broadcast('changeState', state);

                        if (toState.name === "home.people" && fromState.name === "home.people.profile") {
                            $rootScope.$broadcast('getUsers');
                        }

                        if (!((fromState.name === "home.settings") && ($cookies.get('myUserRole') !== 'Admin'))) {
                            // do not add to the opHistory stack if the states are same
                            if(((fromState.name === "home.projects" && toState.name === "home.projects") || (fromState.name === "home.projectlist" && toState.name === "home.projectlist") || (fromState.name === "home.projects.detail" && toState.name === "home.projects.detail")) &&
                                (fromParams.manager===toParams.manager)){
                                console.log('do nothing');
                            }
                            else{
                              if (state.params.manager) {
                                delete state.params.manager;
                              }

                                $rootScope.opHistory.push(state);
                            }
                        }
                    }


                }
            }
        }

        delete $rootScope.back;
        $rootScope.user = AuthenticationFactory.user;
        $rootScope.fname = AuthenticationFactory.fname;
        $rootScope.lname = AuthenticationFactory.lname;
        $rootScope.previousState = fromState;
        $rootScope.preStateParams = fromParams;
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        console.log(event);
        console.log(error);
    });
});
