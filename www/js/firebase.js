angular.module('starter')
  .factory("firebaseService",['appState', '$state', function(appState, $state){ 

    var config = {
      apiKey: "AIzaSyAQchOOXdXejiMOcTKoj_w6hDbg-01m3jQ",
      authDomain: "map-notes-d1949.firebaseapp.com",
      databaseURL: "https://map-notes-d1949.firebaseio.com",
      storageBucket: "map-notes-d1949.appspot.com",
    };

    firebase.initializeApp(config);

    //var userId = firebase.auth().currentUser.uid;
    //var userId = 'piyDDcON4kZPoS1KxwwE4tk7mGM2';
    return{
      fb: firebase
    }

  }])