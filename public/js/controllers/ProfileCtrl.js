(function() {

  angular
    .module('circleofcare')
    .controller('ProfileCtrl', ProfileCtrl);

  ProfileCtrl.$inject = ['$rootScope', '$location', 'meanData'];
  function ProfileCtrl($rootScope, $location, meanData) {

    $rootScope.logout = function(){
      authentication.logout();
      $rootScope.isLoggedIn = authentication.isLoggedIn();
    }

    var vm = this;

    vm.user = {};

    meanData.getProfile()
      .then(function(data) {
        vm.user = data.data;
        console.log(vm.user);
      });
  }

})();
