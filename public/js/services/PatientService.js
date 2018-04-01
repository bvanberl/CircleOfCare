angular.module('PatientService', []).factory('Patient', ['$http', function($http) {
    return {
        // call to get all patients
        get : function() {
            return $http.get('/api/patients');
        },

        get : function(id) {
            return $http.get('/api/patients/' + id);
        },

        // call to POST and create a new patient
        create : function(patientData) {
            return $http.post('/api/patients', patientData);
        },

        // call to PUT and update a patient
        update : function(patientData) {
          var g = jQuery.parseJSON(patientData);
            return $http.put('/api/patients/' + g._id, patientData);
        },

        // call to DELETE a patient
        delete : function(id) {
            return $http.delete('/api/patients/' + id);
        }
    }
}]);
