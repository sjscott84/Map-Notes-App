angular.module('starter')
  .value("user", {})
  .factory('firebaseAuth', ['firebaseService', '$state', 'user', function(firebaseService, $state, user){
    var provider = new firebase.auth.GoogleAuthProvider();

  firebase.auth().onAuthStateChanged(function(currentUser) {
    if (currentUser) {
      user.data = currentUser;
      console.log(user);
    } else {
      // No user is signed in.
    }
  });

  return {
    googleLogin: function(){
      firebase.auth().signInWithRedirect(provider)
      .then(function(){
        $state.go('map')
      });
    }
  }
}])