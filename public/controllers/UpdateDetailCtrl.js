/**
 * Created by Xunrong Li on 8/27/15.
 * Controller for updating detail modal
 */
ResrcUtilApp.controller('UpdateDetailController', function ($scope, $rootScope, $filter, globalState) {
    var tempUser = angular.copy(globalState.userProfile);
    var today = new Date();

    $scope.person = globalState.userProfile;
    $scope.person.name = $scope.person.fname + " " + $scope.person.lname;
    $scope.person.vacations = $filter('orderBy')($scope.person.vacations, "start_date");

    angular.forEach($scope.person.vacations, function (vacation, key) {
        vacation.dates = $filter('date')(vacation.start_date, 'MM/dd/yy') + ' - ' + $filter('date')(vacation.end_date, 'MM/dd/yy');
        var todayDate = new Date();
        todayDate.setHours(0);
        todayDate.setMinutes(0);
        todayDate.setSeconds(0);
        todayDate.setMilliseconds(0);
        var today = todayDate.getTime();
        // if vacation range is less than today, do not make the field editable
        if (vacation.start_date >= today || (vacation.end_date  + ((23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000))) >= today) {
            vacation.editable = true;
        } else {
            vacation.editable = false;
        }

        vacation.isEdit = false;
    });

    $scope.currentDate = new Date().toString();

    $scope.yesterday = new Date(today);
    $scope.yesterday.setDate(today.getDate() - 1);
    $scope.yesterday = $scope.yesterday.toString();

    globalState.tmpUserProfile = $scope.person;
    $scope.tmpPerson = angular.copy($scope.person);
    $scope.vacationInput = "";
    $scope.vacationLocation = "";
    $scope.vacationContact = "";
    $scope.vacationReason = "";

    $scope.$on("editUserVacation", function (event) {
        var tempPersonVacations = angular.copy($scope.person.vacations);

        angular.forEach(tempPersonVacations, function (vacation, key) {
          delete vacation.dates;
          delete vacation.editable;
          delete vacation.isEdit;
        });

        $scope.person.vacations = angular.copy(tempPersonVacations);
        globalState.userProfile.vacations = angular.copy(tempPersonVacations);
        $scope.addVacation();
    });

    $scope.editVacation = function(idx){
      var dateRange = angular.element(document.querySelector('#date-vacation-' + idx));
      $scope.person.vacations[idx].start_date = new Date(dateRange.data('start-date')).getTime();
      $scope.person.vacations[idx].end_date = new Date(dateRange.data('end-date')).getTime();
    };

    $scope.changeShow = function(index){
      //clear all editable rows
        angular.forEach($scope.person.vacations, function(vacation, vacay_key) {
          if (vacay_key === index) {
            vacation.isEdit = !vacation.isEdit;
          } else {
            vacation.isEdit = false;
          }
        });
    };

    $scope.addVacation = function () {
        $scope.vacationDatesError = false;
        var vacation_dates = angular.element(document.querySelector('#vacation-dates'));

        if ($scope.vacationLocation !== "" || $scope.vacationContact !== "" || $scope.vacationReason !== "") {
            if (vacation_dates.data('start-date') === undefined || vacation_dates.data('end-date') === undefined) {
                $scope.vacationDatesError = true;
            }
            if ($scope.vacationDatesError === false) {
                var start_date = vacation_dates.data('start-date').getTime();
                // add 23hrs,59mins,59secs to the end_date
                var end_date = vacation_dates.data('end-date').getTime();

                var new_vacation = {
                    start_date: start_date,
                    end_date: end_date,
                    location: $scope.vacationLocation,
                    contact_info: $scope.vacationContact,
                    reason: $scope.vacationReason,
                    dates: $filter('date')(start_date, 'MM/dd/yyyy') + ' - ' + $filter('date')(end_date, 'MM/dd/yyyy'),
                    editable: (start_date >= today || (end_date + ((23 * 60 * 60 * 1000) + (59 * 60 * 1000) + (59 * 1000))) >= today) ? true : false
                };

                var new_vacationWODates = {
                    start_date: start_date,
                    end_date: end_date,
                    location: $scope.vacationLocation,
                    contact_info: $scope.vacationContact,
                    reason: $scope.vacationReason
                };

                $scope.person.vacations.push(new_vacation);
                // remove unnecessary attributes dates and editable
                angular.forEach($scope.tmpPerson.vacations, function (vacation, key) {
                    delete vacation.dates;
                    delete vacation.editable;
                    delete vacation.isEdit;
                });
                $scope.tmpPerson.vacations.push(new_vacationWODates);
                globalState.tmpUserProfile = $scope.tmpPerson;
                globalState.userProfile = $scope.tmpPerson;
                vacation_dates.removeData('start-date');
                vacation_dates.removeData('end-date');
                $scope.vacationInput = "";
                $scope.vacationLocation = "";
                $scope.vacationContact = "";
                $scope.vacationReason = "";
            }
            else {
                globalState.validation = false;
            }
        }
    };

    $scope.removeVacation = function (index) {
        $scope.person.vacations = $filter('orderBy')($scope.person.vacations, "start_date");
        $scope.person.vacations.splice(index, 1);
        $scope.tmpPerson.vacations = angular.copy($scope.person.vacations);
        angular.forEach($scope.tmpPerson.vacations, function (vacation, key) {
            delete vacation.editable;
            delete vacation.dates;
        });

    };

    $scope.$on('cancelModal', function () {
        $scope.person.job_title = tempUser.job_title;
        $scope.person.phone_number = tempUser.phone_number;
        $scope.person.vacations = angular.copy(tempUser.vacations);
        globalState.userProfile.vacations = angular.copy($scope.person.vacations);
    });
});
