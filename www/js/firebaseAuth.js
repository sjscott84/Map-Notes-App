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
      googleLogin: function(callback){
        firebase.auth().signInWithRedirect(provider)
        .then(function(){
          callback();
          console.log("google sign in successful (apparently)")
        }).catch(function(err) {
          console.log(err);
        });
      },
      logout: function(){
        firebase.auth().signOut().then(function(){
        })
      }
    }
}])