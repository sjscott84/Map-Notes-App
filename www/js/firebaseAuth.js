angular.module('starter')
  .value("user", {})
  .factory('firebaseAuth', ['$state', 'user', 'firebaseService', 'firebaseData', function($state, user, firebaseService, firebaseData){
    var firebase = firebaseService.fb;
    var provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().onAuthStateChanged(function(currentUser) {
      if (currentUser) {
        user.data = currentUser;
        firebaseData.pageSetUp();
        firebaseData.getPlaces();
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
      }
    }
}])