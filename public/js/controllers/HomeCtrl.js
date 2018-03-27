angular.module('HomeCtrl', ['ngAnimate']).controller('HomeController', ['$scope', '$rootScope', '$location', 'authentication', function($scope, $rootScope, $location, authentication) {
    $rootScope.isLoggedIn = authentication.isLoggedIn();

    $rootScope.logout = function(){
      authentication.logout();
      $rootScope.isLoggedIn = authentication.isLoggedIn();
    }

  }]);
