angular.module('ProviderService', []).factory('Provider', ['$http', function($http) {
    return {
        // call to get all textMessages
        get : function() {
            return $http.get('/api/providers');
        },

        // call to DELETE a provider
        delete : function(id) {
            return $http.delete('/api/providers/' + id);
        }
    }
}]);
