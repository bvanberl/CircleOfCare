(function () {

  angular
    .module('circleofcare')
    .controller('RegisterCtrl', RegisterCtrl);
  RegisterCtrl.$inject = ['$rootScope', '$location', 'authentication'];
  function RegisterCtrl($rootScope, $location, authentication) {

    /*if(!authentication.isLoggedIn()){
      $location.path('/');
    }*/

    $rootScope.logout = function(){
      authentication.logout();
      $rootScope.isLoggedIn = authentication.isLoggedIn();
    };
    var vm = this;

    vm.credentials = {
      name : "",
      email : "",
      password : "",
      profession : "",
    };

    vm.onSubmit = function () {
      console.log('Submitting registration');
      authentication
        .register(vm.credentials)
        .then(function(){
          $location.path('profile');
        });
    };

  }

})();
