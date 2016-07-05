// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngCordova'])

app.value('listView', []);
app.value('allPlaces', []);
app.value('existingPlaces', {
  groups: ["All"],
  types: ["All"]
});
app.value('currentPlace', {});
app.value('currentPosition', {
  lat: '',
  lng: '',
  radius: 2
})
app.value('appState',{
  ready: false,
  cordova: false,
  online: false
});

app.run( function($ionicPlatform, $http, $rootScope, appState) {
  //$rootScope.user = user;
  $rootScope.appState = appState;
  window.appState = appState;
  var isDeviceOnline = navigator.onLine;

  if(isDeviceOnline){
    console.log(appState.online)
    appState.online = true;
    console.log(appState.online);
    var script   = document.createElement("script");
    script.setAttribute("src", "js/firebase.js");
    document.head.appendChild(script);
  }else{
    appState.online = false;
  }

  $ionicPlatform.ready(function() {
    appState.ready = true;

    if(window.cordova){
      appState.cordova = true;

      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
      if (cordova.InAppBrowser) {
        window.open = cordova.InAppBrowser.open
      }
    }
  });
    //firebaseData.pageSetUp();
    //firebaseData.getPlaces();
})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home',{
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })
  .state('map', {
    url: '/map',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })
  .state('edit', {
    url: '/edit',
    templateUrl: 'templates/edit.html',
    controller: 'editCtrl'
  })
  .state('offline', {
    url: '/offline',
    templateUrl: 'templates/offline.html',
    controller: 'offlineCtrl'
  });

  $urlRouterProvider.otherwise("/home");
})



 










