(function () {

  angular
  .module('circleofcare')
  .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$rootScope', '$location', 'authentication'];
  function LoginCtrl($rootScope, $location, authentication) {
    var vm = this;

    $rootScope.logout = function(){
      authentication.logout();
      $rootScope.isLoggedIn = authentication.isLoggedIn();
    };

    vm.credentials = {
      email : "",
      password : ""
    };

    vm.isLoggedIn = authentication.isLoggedIn();

    vm.onSubmit = function () {
      authentication
        .login(vm.credentials)
        .then(function(){
          $location.path('/');
        });
    };
  }

})();
