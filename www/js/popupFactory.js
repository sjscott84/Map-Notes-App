angular.module('starter')
  .factory('popup', ['$ionicPopup', 'listView', 'placeConstructor', 'existingPlaces', '$state', '$window', 'appState', '$injector', 'firebaseAuth', '$timeout', function($ionicPopup, listView, placeConstructor, existingPlaces, $state, $window, appState, $injector, firebaseAuth, $timeout){
    //Input details and save a new search to database
    function inputPlaceInfoFn(placeObject, mapScope, map){
      mapScope.data = {};
      var myPopup = $ionicPopup.show({
        templateUrl: 'templates/popup.html',
        title: placeObject.name,
        scope: mapScope,
        buttons: [
          { text: 'Cancel',
            onTap: function(){
              placeObject = {};
            }
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
              placeObject.group = mapScope.data.group;
              placeObject.type = mapScope.data.type;
              placeObject.notes = mapScope.data.notes;

              //listView.push(new placeConstructor.Place(placeObject.name, placeObject.latitude, placeObject.longitude, placeObject.type, placeObject.notes, placeObject.address, ''));
              if(existingPlaces.groups.indexOf(placeObject.group) === -1){
                existingPlaces.groups.push(placeObject.group);
              }
              if(existingPlaces.types.indexOf(placeObject.type) === -1){
                existingPlaces.types.push(placeObject.type);
              }
              var service;
              //if(!appState.offline){
                service = $injector.get('firebaseData');
              //}
              service.savePlace(placeObject.group, placeObject.type, placeObject, map);
            }
          }
        ]
      })
    }
    //Alert an error
    function createAccountErrors (code, message){
      var alertPopup = $ionicPopup.alert({
        title: code,
        template: message
       });
    }
    return {
      //Alert and error
      loginErrors: function(error){
        createAccountErrors(error.code, error.message);
      },
      //Create an account using email
      createAccount: function(scope){
        scope.data = {};
        var myPopup = $ionicPopup.show({
          title: 'Create Account',
          template: '<input placeholder=" Email" type="text" ng-model="data.email"><br><input placeholder=" Password" type="password" ng-model="data.password">',
          scope: scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: '<b>Create Account</b>',
              type: 'button-positive',
              onTap: function() {
                var service;
                //if(!appState.offline){
                  service = $injector.get('firebaseAuth');
                //}
                service.createAccount(scope.data.email, scope.data.password, function(code, message){
                  var codeForPopup;
                  if(code === 'auth/email-already-in-use'){
                    codeForPopup = 'Error with Email';
                  }else if(code === 'auth/weak-password'){
                    codeForPopup = 'Error with Password';
                  }else if(code === 'auth/invalid-email'){
                    codeForPopup = 'Error with Email';
                  }else{
                    codeForPopup === 'Error';
                  }
                  createAccountErrors(codeForPopup, message);
                });
              }
            }
          ]
        })
      },
      //Sign in with email account
      signinEmail: function(scope){
        scope.data = {};
        var myPopup = $ionicPopup.show({
          title: 'Sign In',
          template: '<input placeholder=" Email" type="text" ng-model="data.email"><br><input placeholder=" Password" type="password" ng-model="data.password">',
          scope: scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: '<b>Sign In</b>',
              type: 'button-positive',
              onTap: function() {
                var service;
                if(!appState.offline){
                  service = $injector.get('firebaseAuth');
                }
                service.signinEmail(scope.data.email, scope.data.password, function(code, message){
                  createAccountErrors(code, message);
                });
              }
            }
          ]
        })
      },
      //Confirmation to save a new place
      saveRequest: function(placeObject, mapScope, map){
        var myPopup = $ionicPopup.show({
          title: placeObject.name,
          subTitle: "Do you want to save this place?",
          scope : mapScope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: '<b>Save</b>',
              type: 'button-positive',
              onTap: function() {
                inputPlaceInfoFn(placeObject, mapScope, map);
              }
            }
          ]
        })
      },
      //Search for places based on group and type
      getPlaces: function(scope, map){
        scope.data = {};
        var myPopup = $ionicPopup.show({
          templateUrl: 'templates/findPlaces.html',
          title: 'Find Places By Location',
          scope: scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: 'Retrieve Places',
              type: 'button-positive',
              onTap: function() {
                //console.log(scope.data.selectedGroup);
                var service;
                //if(!appState.offline){
                  service = $injector.get('firebaseData');
                //}
                service.searchForPlaces(scope.data.selectedGroup, scope.data.selectedType, map);
              }
            }
          ]
        })
      },
      //Confirmation that user wishes to delete an exisiting place
      deletePlace: function(scope, item){
        var myPopup = $ionicPopup.show({
          title: "Are you sure you want to delete "+item.name+"?",
          scope : scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: '<b>Delete</b>',
              type: 'button-assertive',
              onTap: function() {
                var service;
                //if(!appState.offline){
                  service = $injector.get('firebaseData');
                //}
                service.deletePlace(item.group, item.uid);
              }
            }
          ]
        })
      },
      deleteGroup: function(scope, item){
        console.log(item);
        var myPopup = $ionicPopup.show({
          title: "Are you sure you want to delete "+item.name+"?",
          scope : scope,
          buttons: [
            { text: 'Cancel',
              onTap: function(){
              } 
            },
            {
              text: '<b>Delete</b>',
              type: 'button-assertive',
              onTap: function() {
                var service;
                //if(!appState.offline){
                  service = $injector.get('firebaseData');
                //}
                service.deleteGroup(item.name);
              }
            }
          ]
        })
      },
      //Popup with details of place to edit
      editItem: function(scope, item){
        scope.data = {group: item.group, type: item.type, note: item.notes};
        scope.item = item;
        var myPopup = $ionicPopup.show({
          templateUrl: 'templates/editPopup.html',
          title: item.name,
          scope: scope,
          buttons: [
            {
            text: 'Cancel',
              onTap: function(){
              }
            },
            {
            text: '<b>Save</b>',
            type: 'button-positive',
              onTap: function(e) {
                var service;
                //if(!appState.offline){
                  service = $injector.get('firebaseData');
                //}
                service.editPlace(scope.data.group, scope.data.type, scope.data.note, scope.item);
              }
            }
          ]
        })
      },
      //Could not get location when app opens
      couldNotGetLocation: function(){
        var alertPopup = $ionicPopup.alert({
          title: 'Error',
          template: 'Could not get your location, please use the Catagories search to find things near you'
         });
      },
      offlineMessage: function(){
        var alertPopup = $ionicPopup.alert({
          title: 'Offline',
          template: 'You are appear to be offline, you can still view a list of your places, but maps will be unavaiable until you are back online'
         });
        $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
        }, 4000);
      },
      onlineMessage: function(){
        var myPopup = $ionicPopup.show({
          title: 'Internet Connection Detected',
          subTitle: "Internet connection detected, would you like to return to the map?",
          buttons: [
            {
            text: 'Cancel',
              onTap: function(){
              }
            },
            {
            text: '<b>Return to Map</b>',
            type: 'button-positive',
              onTap: function() {
                if(appState.mapReady){
                  $state.go('map');
                }else{
                  $state.go('map');
                  $window.location.reload();
                }
              }
            }
          ]
        })
        $timeout(function() {
          myPopup.close(); //close the popup after 3 seconds for some reason
        }, 4000);
      }
    }
  }]);
