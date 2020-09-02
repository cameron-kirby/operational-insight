(function () {
  'use strict';

  angular
    .module('ResrcUtilApp.UserProfile')
    .controller('UserProfileController', UserProfileController);

  UserProfileController.$inject = [
    '$location',
    '$log',
    '$modal',
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'isProfileDetailView',
    'globalState',
    'mainFactory',
    'ModalFactory',
    'SKILL_COLORS'
  ];

  function UserProfileController(
    $location,
    $log,
    $modal,
    $q,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $timeout,
    isProfileDetailView,
    globalState,
    mainFactory,
    ModalFactory,
    SKILL_COLORS
  ) {
    var profileVM = this;
    var root = $rootScope;
    var g = globalState;

    var utilVerifyDuration = {};

    profileVM.showUtilizationVerifyOverlay = false;
    profileVM.projectView = 'projectList';
    profileVM.isProfileDetailView = isProfileDetailView;
    profileVM.getRandomColors = getRandomColors;
    profileVM.changeProjectView = changeProjectView;
    profileVM.addVacation = addVacation;
    profileVM.addNewProject = addNewProject;
    profileVM.addNewSkill = addNewSkill;
    profileVM.editManager = editManager;

    profileVM.utilVerifyState = {
      current: 'UNVERIFIED',
      PENDING: 'PENDING',
      UNVERIFIED: 'UNVERIFIED',
      VERIFIED: 'VERIFIED'
    };

    profileVM.utilVeriyButtonText = getVerifyButtonText();
    profileVM.handleValidateUtilizationButtonClicked = handleValidateUtilizationButtonClicked;
    profileVM.getVerifyButtonCssClasses = getVerifyButtonCssClasses;

    g.fromProfile = true;
    g.currentView.name = 'PeopleDetail';
    g.currentView.toggle = 'closed';
    root.currentProfileName = '';


    activate();


    $scope.$on('updateUserVacation', function () {
      profileVM.person.vacations = angular.copy(g.userProfile.vacations);
    });


    /**
     * Defaults the utilization validation duration to two weeks.
     */
    function useDefaultUtiliationUpdateFrequency() {
      $log.error('Failed to load utilizationVerificationEmail document.'
        + ' Using default of 2 weeks.');

      utilVerifyDuration = {
        years: 0,
        months: 0,
        weeks: 2,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    /**
     * Determines how often a person needs to update their utilization.
     *
     * @returns {q.defer}
     *    The promise to return the validateUtilizationEmail ScheduledTask doucment.
     */
    function getUtilizationUpdateFrequency() {
      var deferred = $q.defer();

      mainFactory.findScheduledTaskById('utilizationVerificationEmail')
        .then(function (document) {
          if (!document.parameters.verifyDuration) {
            useDefaultUtiliationUpdateFrequency();
          }
          utilVerifyDuration = document.parameters.verifyDuration;
          deferred.resolve();
        })
        .catch(function () {
          useDefaultUtiliationUpdateFrequency();
          deferred.resolve();
        });

      return deferred.promise;
    }

    /**
     * Gets the user's utilizations, so we can determine if they are up to date.
     *
     * @returns {q.defer}
     *    The promise to determine if a user is up to date.
     */
    function getUserUtilization() {
      var deferred = $q.defer();

      mainFactory.getUserUtilizations(new Date().getFullYear(), $stateParams.userID)
        .then(function (document) {
          // Determine if the user's utilization is in date.
          var expiredDate = moment();
          expiredDate.subtract(utilVerifyDuration.years, 'years');
          expiredDate.subtract(utilVerifyDuration.months, 'months');
          expiredDate.subtract(utilVerifyDuration.weeks, 'weeks');
          expiredDate.subtract(utilVerifyDuration.days, 'days');
          expiredDate.subtract(utilVerifyDuration.hours, 'hours');
          expiredDate.subtract(utilVerifyDuration.minutes, 'minutes');
          expiredDate.subtract(utilVerifyDuration.seconds, 'seconds');

          if (expiredDate.toDate().getTime() >= document.pageInfo.updated_date) {
            profileVM.utilVerifyState.current = profileVM.utilVerifyState.UNVERIFIED;
          } else {
            profileVM.utilVerifyState.current = profileVM.utilVerifyState.VERIFIED;
          }

          profileVM.utilVeriyButtonText = getVerifyButtonText();

          deferred.resolve();
        })
        .catch(function (error) {
          $log.error('An error occured fetching the [' + $stateParams.userID
            + '] utilization. Error [' + error + ']');
          profileVM.utilVerifyState = profileVM.utilVerifyState.UNVERIFIED;

          deferred.resolve();
        });

      return deferred.promise;
    }

    function activate() {
      getUser()
        .then(getUtilizationUpdateFrequency)
        .then(getUserUtilization)
        .then(function () {
          if ($stateParams.action === 'validateUtilization') {
            handleValidateUtilizationButtonClicked();
          }
        })
        .catch(function () {
          $log.error('Failed to initialize profile view for user [' + $stateParams.userID + ']');
        })
        .finally(function () {
          root.loading = false;
        });
    }

    function getUser() {
      var deferred = $q.defer();
      root.cardViewLoading = true;


      mainFactory.getUserProfile($stateParams.userID).then(function (data) {
        profileVM.person = data.item;
        root.currentProfileName = profileVM.person.fname + ' ' + profileVM.person.lname;

        profileVM.dataLoaded = true;
        root.cardViewLoading = false;

        // store the value for modal use
        if ($stateParams.userID === g.userProfile._id) {
          g.userProfile = profileVM.person;
        }

        g.profileDataLoaded = true;

        // check if person currently have skills
        if (profileVM.person.hasOwnProperty('skills')) {
          profileVM.person.skills.forEach(function (elem) {
            // assign skills colors
            if (elem.category_id) {
              if (!g.skillColorMapping[elem.category_id]) {
                g.skillColorMapping[elem.category_id] = getRandomColors();
              }
            }
          });
        } else {
          $log.error($stateParams.userID + ' does not currently have skills.');
        }

        profileVM.skillColorMapping = globalState.skillColorMapping;
        deferred.resolve();
      })
      .catch(function (reason) {
        $log.error('Failed because ' + reason);
        root.cardViewLoading = false;
        deferred.reject(reason);
      });

      return deferred.promise;
    }

    function getRandomColors() {
      return SKILL_COLORS[Math.floor(Math.random() * SKILL_COLORS.length)];
    }

    function changeProjectView(view) {
      profileVM.projectView = view;
    }

    function addVacation() {
      $state.go('home.people.profile.edit.tab', { edit: 'Details' });
    }

    function addNewProject() {
      $state.go('home.people.profile.edit.tab', { edit: 'Projects' });
    }

    function addNewSkill() {
      $state.go('home.people.profile.edit.tab', { edit: 'Skills' });
    }

    function editManager(user) {
      ModalFactory.editManager(user);
    }

    function handleValidateUtilizationButtonClicked() {
      root.cardViewLoading = true;
      profileVM.utilVerifyState.current = profileVM.utilVerifyState.PENDING;
      profileVM.utilVeriyButtonText = getVerifyButtonText();
      mainFactory.validateUserUtilization($stateParams.userID)
        .then(function () {
          profileVM.showUtilizationVerifyOverlay = true;
          profileVM.utilVerifyState.current = profileVM.utilVerifyState.VERIFIED;
          profileVM.utilVeriyButtonText = getVerifyButtonText();
          $timeout(function () {
            profileVM.showUtilizationVerifyOverlay = false;
          }, 3000);
        })
        .catch(function (error) {
          $log.error('Failed to validate utilization [' + error + ']');
          profileVM.utilVerifyState.current = profileVM.utilVerifyState.UNVERIFIED;
          profileVM.utilVeriyButtonText = getVerifyButtonText();
        })
        .finally(function () {
          root.cardViewLoading = false;
        });
    }

    function getVerifyButtonCssClasses() {
      switch (profileVM.utilVerifyState.current) {
        default:
        case profileVM.utilVerifyState.UNVERIFIED:
        case profileVM.utilVerifyState.PENDING: {
          return '';
        }
        case profileVM.utilVerifyState.VERIFIED: {
          return 'ion-checkmark verify-check';
        }
      }
    }

    function getVerifyButtonText() {
      switch (profileVM.utilVerifyState.current) {
        default:
        case profileVM.utilVerifyState.PENDING:
        case profileVM.utilVerifyState.UNVERIFIED: {
          return 'Verify';
        }
        case profileVM.utilVerifyState.VERIFIED: {
          return 'Verified';
        }
      }
    }
  }
}());
