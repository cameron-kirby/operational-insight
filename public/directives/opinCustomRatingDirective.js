/**
 * Created by Caesar Cavales on 10/30/15.
 * Customized Directive: Settings View <opin-custom-rating></opin-custom-rating>
 */

 ResrcUtilApp.directive('opinCustomRating', function (globalState) {
    return {
    require: ['opinCustomRating', 'ngModel'],
    scope: {
      readonly: '=?'
    },
    controller: 'opinCustomRatingController',
    templateUrl: 'views/opinCustomRating.html',
    replace: true,
    link: function(scope, element, attrs, ctrls) {
      var ratingCtrl = ctrls[0], ngModelCtrl = ctrls[1];
      ratingCtrl.init(ngModelCtrl);
    }
  };
});       