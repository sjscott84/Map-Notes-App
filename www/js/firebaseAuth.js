angular.module('starter')
  .value("user", {})
  .factory('firebaseAuth', ['$state', 'user', 'firebaseService', 'firebaseData', '$timeout', '$cordovaOauth', 'appState', function($state, user, firebaseService, firebaseData, $timeout, $cordovaOauth, appState){
    var firebase = firebaseService.fb;
    var provider = new firebase.auth.GoogleAuthProvider();
    var fbProvider = new firebase.auth.FacebookAuthProvider();

    firebase.auth().onAuthStateChanged(function(currentUser){
      if(currentUser){
        $timeout(function(){
          user.data = currentUser;
          user.displayName = user.data.displayName;
          if(!user.data.displayName){
            user.displayName = currentUser.email;
          }
          console.log(user.data.displayName);
          $state.go('map');
          firebaseData.pageSetUp();
          firebaseData.getPlaces();
        }, 0);
      }else{
        console.log('No User');
      }
    });

    function signInWithCredential(credential, callback) {
      firebase.auth().signInWithCredential(credential)
          .then(function(result) {
          })
          .catch(function(error){callback(error)});
    }

    return {
      googleLogin: function(callback){
        console.log(appState.cordova);
        if (appState.cordova) {
          $cordovaOauth.google("225031542438-trph43971tepg2g6085aoci4sujs26hb.apps.googleusercontent.com", ["email"])
            .then(function(result) {
                var credential = firebase.auth.GoogleAuthProvider.credential(result.id_token, result.access_token);
                signInWithCredential(credential, callback);
            });
        }else{
          firebase.auth().signInWithRedirect(provider)
          .then(function(){
            console.log("google sign in successful (apparently)");
          }).catch(function(err) {
            callback(err);
          });
        }
      },
      facebookLogin: function(callback){
        firebase.auth().signInWithPopup(fbProvider).catch(function(error){callback(error)})
        /*firebase.auth().signInWithRedirect(fbProvider)
        firebase.auth().getRedirectResult().then(function(result){
          if(!result){
            console.log("Null User")
          }else{
            console.log(result);
          }
          }).catch(function(error) {callback(error)})*/
      },
      logout: function(){
        firebase.auth().signOut().then(function(){
        })
      },
      createAccount: function(email, password, callback){
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          callback(errorCode, errorMessage);
        });
      },
      signinEmail: function(email, password, callback){
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          callback(errorCode, errorMessage);
        });
      }
    }
}])