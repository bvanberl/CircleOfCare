angular.module('NavCtrl', []).controller('NavCtrl',['$scope', '$rootScope', '$window', '$location', 'authentication', function($scope, $rootScope, $window, $location, authentication){
  // Initialization
  $scope.isLoggedIn = authentication.isLoggedIn();
      console.log($scope.isLoggedIn);
  if($scope.isLoggedIn) {
    $location.path('/dashboard');
  }

  $scope.logout = function(){
    authentication.logout();
    $scope.isLoggedIn = authentication.isLoggedIn();
    $location.path('/');
    $window.location.reload();
  };

}]);
