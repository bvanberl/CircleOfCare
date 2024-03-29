(function() {

  angular
    .module('circleofcare')
    .service('meanData', meanData);

  meanData.$inject = ['$http', 'authentication'];
  function meanData ($http, authentication) {

    var getProfile = function () {
      /*return $http.get('/api/profile', {
        headers: {
          Authorization: 'Bearer '+ authentication.getToken()
        }
      });*/
      return authentication.currentUser();
    };

    return {
      getProfile : getProfile
    };
  }

})();
