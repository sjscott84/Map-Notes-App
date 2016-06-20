angular.module('starter')
  .value("user", {})
  .factory('firebaseAuth', ['$state', 'user', 'firebaseService', 'firebaseData', '$timeout', function($state, user, firebaseService, firebaseData, $timeout){
    var firebase = firebaseService.fb;
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().onAuthStateChanged(function(currentUser) {
      if (currentUser) {
        $timeout(function(){
          console.log(currentUser);
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
      } else {
        console.log(user);
      }
    });

    return {
      googleLogin: function(){
        firebase.auth().signInWithRedirect(provider)
        .then(function(){
          //
          console.log("google sign in successful (apparently)")
        }).catch(function(err) {
          console.log(err);
        });
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