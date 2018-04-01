angular.module('ImageMessageService', []).factory('ImageMessage', ['$http', function($http) {
    return {
        // call to get all imageMessages
        get : function() {
            return $http.get('/api/image-messages');
        },

        // call to POST and create a new imageMessage
        create : function(imageMessageData) {
            return $http.post('/api/image-messages', imageMessageData);
        },

        // call to PUT and update a imageMessage
        update : function(imageMessageData) {
          var g = jQuery.parseJSON(imageMessageData);
            return $http.put('/api/image-messages/' + g._id, imageMessageData);
        },

        // call to DELETE a imageMessage
        delete : function(id) {
            return $http.delete('/api/image-messages/' + id);
        }
    }
}]);
