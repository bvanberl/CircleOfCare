angular.module('TextMessageService', []).factory('TextMessage', ['$http', function($http) {
    return {
        // call to get all textMessages
        get : function() {
            return $http.get('/api/text-messages');
        },

        // call to POST and create a new textMessage
        create : function(textMessageData) {
            return $http.post('/api/text-messages', textMessageData);
        },

        // call to PUT and update a textMessage
        update : function(textMessageData) {
          var g = jQuery.parseJSON(textMessageData);
            return $http.put('/api/text-messages/' + g._id, textMessageData);
        },

        // call to DELETE a textMessage
        delete : function(id) {
            return $http.delete('/api/text-messages/' + id);
        }
    }
}]);
