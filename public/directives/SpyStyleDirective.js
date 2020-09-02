ResrcUtilApp.directive('spyStyle', function() {

    return {

        restrict: 'A',

        link: function($scope, $element, attrs) {
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (!mutation.addedNodes) return;
                for (var i = 0; i < mutation.addedNodes.length; i++) {

                    var nodeClass = mutation.addedNodes[i].className;

                    if (typeof nodeClass === "string") {
                        var split = nodeClass.split(' ', 1);
                        if (split[0] == 'v-content') {

                            var observer = new MutationObserver(function(mutations) {
                                mutations.forEach(function(mutationRecord) {
                                    if(mutationRecord.target.style.maxHeight === "20px") {
                                        mutationRecord.target.style.maxHeight = "none";
                                    }
                                });
                            });

                            var target = document.getElementsByClassName('skills-list-body');
                            observer.observe(target[0], { childList: true, subtree: true, attributes : true, attributeFilter : ['style'] });
                        }
                    }
                }
              });
            });

            observer.observe(document.body, {
              childList: true, subtree: true, attributes: false, characterData: false
            });
        }

    };

});