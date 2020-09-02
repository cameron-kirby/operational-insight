ResrcUtilApp.directive('infiniteScroll', function(){
    return function(scope, elm, attr) {
        var raw = elm[0];

        elm.bind('scroll', function() {
        	var position = raw.scrollTop + raw.offsetHeight;
        	var height = raw.scrollHeight * 0.80;
            if (position >= height) {
                scope.$apply(attr.infiniteScroll);
            }
        });
    };
});