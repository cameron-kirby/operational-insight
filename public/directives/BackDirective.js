ResrcUtilApp.directive('goBack', function($window, $rootScope, $state, globalState, $cookies){
  return function($scope, $element){

    $element.on('click', function(){
    	$rootScope.back = true;

    	var state = $rootScope.opHistory.pop();

        //console.log($rootScope.opHistory[$rootScope.opHistory.length - 1]);
        $rootScope.$broadcast('changeState', $rootScope.opHistory[$rootScope.opHistory.length - 1]);

    	if(state.name == "home.skills") {
    		globalState.isDetail = false;
    		$rootScope.$broadcast("updateisDetail");
    	}

      state.params.manager = $cookies.get("myManager");
      $state.go(state.name, state.params);
    });
  };
});
