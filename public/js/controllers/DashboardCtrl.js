angular.module('DashboardCtrl', ['ngAnimate']).controller('DashboardController', ['$scope', '$rootScope', '$location', '$mdDialog', '$mdMenu', 'authentication', 'Patient', 'Conversation', 'TextMessage', 'Provider', 'meanData', function($scope, $rootScope, $location, $mdDialog, $mdMenu, authentication, Patient, Conversation, TextMessage, Provider, meanData) {
    $rootScope.isLoggedIn = authentication.isLoggedIn();
    $scope.profile = meanData.getProfile();
    $scope.conversations = [];
    $scope.patients = [];
    $scope.selectedConversationIndex = -1;
    $scope.selectedConversation = {};
    $scope.conversationDisplayed = false;
    $scope.msgsToDisplay = [];
    $scope.providersToDisplay = [];
    $scope.allProviders = [];
    getConversations();
    Provider.get()
        .then(function (response) {
            $scope.allProviders = response.data;
        }, function (error) {
            $scope.status = 'Unable to load patient data: ' + error.message;
        });

    $rootScope.logout = function(){
      authentication.logout();
      $rootScope.isLoggedIn = authentication.isLoggedIn();
    }

    // Get all conversations that this provider is in.
  function getConversations() {
      $scope.conversations = [];
      Conversation.get()
          .then(function (response) {
              var allConversations = response.data;
              for(var i = 0; i < allConversations.length; i++) {
                if(allConversations[i].providers.indexOf($scope.profile._id) !== -1 && allConversations[i].patient.length > 0){
                  $scope.conversations.push(allConversations[i]);
                }
              }
          }, function (error) {
              $scope.status = 'Unable to load patient data: ' + error.message;
          });
          console.log($scope.conversations);
  }

  $scope.openConversation = function(i) {
    $scope.conversationDisplayed = true;
    $scope.selectedConversationIndex = i;
    $scope.selectedConversation = $scope.conversations[$scope.selectedConversationIndex];
    Conversation.get($scope.selectedConversation._id)
        .then(function (response) {
                console.log(response);
                $scope.msgsToDisplay = response.data.messages;
                $scope.providersToDisplay = response.data.providers;
        }, function (error) {
            $scope.status = 'Unable to load patient data: ' + error.message;
        });

    console.log($scope.msgsToDisplay);
  }

  $scope.addProviderToConversation = function(i) {
    if($scope.conversations.indexOf("$scope.allProviders[i]._id") === -1){
    $scope.selectedConversation.providers.push($scope.allProviders[i]._id);
    Conversation.update(JSON.stringify($scope.selectedConversation))
      .then(function(resp){
         $scope.openConversation($scope.selectedConversationIndex);
      });
    }
  }

  $scope.submitTextMessage = function() {
    if($scope.newTextMsg.length > 0) {
      var textMsgData = {};
      textMsgData.postedBy = $scope.profile._id;
      textMsgData.message = $scope.newTextMsg;
      TextMessage.create(textMsgData)
        .then(function (response) {
          $scope.selectedConversation.messages.push(response.data._id);
          Conversation.update(JSON.stringify($scope.selectedConversation))
            .then(function(resp){
               $scope.openConversation($scope.selectedConversationIndex);
            });
        }, function (error) {
          $scope.status = 'Unable to create new patient: ' + error.message;
        }); // Add new patient to database.
    }
  }

  // Comparator for sorting Patient objects
  function sortPatients(prop, asc) {
      $scope.patients = $scope.patients.sort(function(a, b) {
      if (asc) {
          return (a[prop] > b[prop]) ? -1 : ((a[prop] < b[prop]) ? 1 : 0);
      } else {
          return (b[prop] > a[prop]) ? -1 : ((b[prop] < a[prop]) ? 1 : 0);
      }
    });
  }

  // Deletes an patient by ID
  $scope.delete = function(id) {
    Patient.delete(id)
      .then(function (response) {
        get(); // Refresh table
      }, function (error) {
        $scope.status = 'Unable to delete patient data: ' + error.message;
      });
  }


  $scope.openNewPatientModal = function(ev) {
    //$scope.modal.modal("show");
    $mdDialog.show({
      controller: NewPatientDialogController,
      templateUrl: '../../views/modals/new-patient-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(patientData) {
        $scope.addPatient(patientData);
      }, function() {
      });
  }

  $scope.openUpdatePatientModal = function(ev, i) {
    var patient = $scope.patients[i];
    $mdDialog.show({
      locals:{
        id: patient._id,
        name: patient.name
      },
      controller: UpdatePatientDialogController,
      templateUrl: '../../views/modals/update-patient-modal.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
    })
    .then(function(patientData) {
        $scope.updatePatient(patientData);
      }, function() {
      });
  }

  // Create new patient with data returned from hiding the modal. Start a conversation centred around the patient.
  $scope.addPatient = function(patientData){
    var copy = JSON.parse(patientData);
    copy["providerId"] = $scope.profile._id;
    patientData = JSON.stringify(copy);
    Conversation.create(patientData)
      .then(function (response) {
        $scope.selectedConversationIndex = -1;
        getConversations();
      }, function (error) {
        $scope.status = 'Unable to create new patient: ' + error.message;
      }); // Add new patient to database.
  }


  // Update the patient with data returned from hiding the modal.
  $scope.updatePatient = function(patientData){
    Patient.update(patientData)
      .then(function (response) {
        get(); // Refresh table
      }, function (error) {
        $scope.status = 'Unable to update patient: ' + error.message;
      }); // Add new patient to database.
  }


  function NewPatientDialogController($scope, $mdDialog) {
    $scope.ipatientcontent = "";
    $scope.focused = true;
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.submitData = function() {
      var patientData =
        '{"name":"' + $scope.ipatientname + '"' +
      '}'; // The patient data
      $mdDialog.hide(patientData);
    };
  }


  function UpdatePatientDialogController($scope, $mdDialog, id, name, address, phone, url) {
    $scope.iid = id;
    $scope.ipatientname = name;
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.submitData = function() {
      var curDT = new Date(); // Get current date and time.
      var patientData =
        '{"_id":"' + $scope.iid + '",' +
        '"name":"' + $scope.ipatientname + '"' +
      '}'; // The patient data
      $mdDialog.hide(patientData);
    };
  }

  }]);
