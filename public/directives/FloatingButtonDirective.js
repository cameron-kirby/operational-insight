/**
 * Created by Xunrong Li on 7/2/15.
 * Directive for floating button
 */

ResrcUtilApp.directive('floatingButton',
    function ($cookies, $state, $rootScope) {
        return {
            restrict: "A",
            scope: true,
            link: function (scope, element, attrs) {
                //add profile image to the expanded floating button
                var id = $cookies.get('myID');
                $('.my-mfb li.profile-image a i').css('background-image', 'url(https://images.w3ibm.mybluemix.net/image/' +
                    id + '.jpg?s=115)');

                $('.my-mfb li.profile-image a').click(function() {
                    $state.go('home.people.profile', {userID: id});
                });

            }
        };
    });
