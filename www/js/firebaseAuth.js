angular.module('starter')
  .value("user", {})
  .factory('firebaseAuth', ['$state', 'user', 'firebaseService', 'firebaseData', '$timeout', '$cordovaOauth', 'appState', function($state, user, firebaseService, firebaseData, $timeout, $cordovaOauth, appState){
    var firebase = firebaseService.fb;
    var provider = new firebase.auth.GoogleAuthProvider();
    var fbProvider = new firebase.auth.FacebookAuthProvider();

    //Watch for changes to the currently logged in user
    firebase.auth().onAuthStateChanged(function(currentUser){
      if(currentUser){
        console.log(currentUser);
        $timeout(function(){
          user.data = currentUser;
          //user.displayName = user.data.displayName;
          if(!user.data.displayName){
            user.displayName = user.data.email;
          }else{
            user.displayName = user.data.displayName;
          }
          firebaseData.pageSetUp();
          firebaseData.getPlaces();
          $state.go('map');
        }, 0);
      }else{
        $state.go('home');
        console.log('No User');
      }
    });

    //Sign in with cordova
    function signInWithCredential(credential, callback) {
      firebase.auth().signInWithCredential(credential).catch(function(error){callback(error)});
    }
    //Sign in when cordova is not avaliable
    function signInWithRedirect(provider, callback){
      firebase.auth().signInWithRedirect(provider)
      firebase.auth().getRedirectResult()
      .catch(function(err) {
        callback(err);
      });
    }

    return {
      //Login using google sign in
      /*googleLogin: function(callback){
        if(appState.cordova){
          $cordovaOauth.google("225031542438-trph43971tepg2g6085aoci4sujs26hb.apps.googleusercontent.com", ["email"])
          .then(function(result) {
              var credential = firebase.auth.GoogleAuthProvider.credential(result.id_token, result.access_token);
              signInWithCredential(credential, callback);
          }).catch(function(err){
            callback(err);
          });
        }else{
          signInWithRedirect(new firebase.auth.GoogleAuthProvider(), callback);
        }
      },*/
      //Login using facebook sign in
      facebookLogin: function(callback){
        if(appState.cordova){
          $cordovaOauth.facebook('247208372329875', [ "public_profile", "email"])
          .then(function(result){
            console.log(result);
            var credential = firebase.auth.FacebookAuthProvider.credential(result.access_token);
            signInWithCredential(credential, callback);
          }).catch(function(err){
            callback(err);
          })
        }else{
          signInWithRedirect(new firebase.auth.FacebookAuthProvider(), callback);
        }
      },
      //Logout
      logout: function(){
        firebase.auth().signOut().then(function(){
        })
      },
      //Create an account using email
      createAccount: function(email, password, callback){
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          callback(errorCode, errorMessage);
        });
      },
      //Sign in with email account
      signinEmail: function(email, password, callback){
        firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          callback(errorCode, errorMessage);
        });
      }
    }
}])