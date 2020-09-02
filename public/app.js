/*
 * Created by Xunrong Li on 6/1/15.
 * Angular app module and dependencies
 * appRoutes - Customized router
 * ngAnimate - Angular animation
 * ng-mfb - Angular material floating button
 * ui.bootstrap - Angular Bootstrap
 * ds.clock - Angular Clock Widget
 * base64 - Angular base64 encode
 * ngCookies - Angular Cookies
 * */
var ResrcUtilApp = angular.module('ResrcUtilApp', [
  'appRoutes',
  'ngMaterial',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'ds.clock',
  'base64',
  'ngCookies',
  'angularMoment',
  '720kb.datepicker',
  '720kb.range.datepicker',
  'vAccordion',
  'ResrcUtilApp.Login',
  'ResrcUtilApp.SkillList',
  'ResrcUtilApp.UserProfile'
]);


 /*
 default ngMaterial primary color to operational-insight green
*/
ResrcUtilApp.config(function materialTheme($mdThemingProvider) {
  var blueTheme = $mdThemingProvider.theme('blueTheme', 'default');
  var bluePalette = $mdThemingProvider.extendPalette('blue', { 500: '#1bac72' });

  $mdThemingProvider.definePalette('bluePalette', bluePalette);
  blueTheme.primaryPalette('bluePalette');
});
