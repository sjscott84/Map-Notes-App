angular.module('starter')
  .factory('popup', ['$ionicPopup', 'listView', 'placeConstructor', 'existingPlaces', 'firebaseData', 'firebaseAuth', function($ionicPopup, listView, placeConstructor, existingPlaces, firebaseData, firebaseAuth){
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
              firebaseData.savePlace(placeObject.group, placeObject.type, placeObject, map);
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
                firebaseAuth.createAccount(scope.data.email, scope.data.password, function(code, message){
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
                firebaseAuth.signinEmail(scope.data.email, scope.data.password, function(code, message){
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
                firebaseData.searchForPlaces(scope.data.selectedGroup, scope.data.selectedType, map);
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
                console.log("delete");
                firebaseData.deletePlace(item.group, item.uid);
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
                firebaseData.editPlace(scope.data.group, scope.data.type, scope.data.note, scope.item);
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
      }
    }
  }]);
