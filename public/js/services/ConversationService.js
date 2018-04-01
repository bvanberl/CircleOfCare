angular.module('ConversationService', []).factory('Conversation', ['$http', function($http) {
    return {
        // call to get all conversations
        get : function(id) {
          if(id)
            return $http.get('/api/conversations/' + id);
          else
            return $http.get('/api/conversations');
        },

        // call to POST and create a new conversation
        create : function(conversationData) {
            return $http.post('/api/conversations', conversationData);
        },

        // call to PUT and update a conversation
        update : function(conversationData) {
          var g = jQuery.parseJSON(conversationData);
            return $http.put('/api/conversations/' + g._id, conversationData);
        },

        // call to DELETE a conversation
        delete : function(id) {
            return $http.delete('/api/conversations/' + id);
        }
    }
}]);
