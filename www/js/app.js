'use strict';
var app = angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngCordova']);

app.value('listView', []);
app.value('allPlaces', []);
app.value('existingPlaces', {
  groups: ["All"],
  types: ["All"]
});
app.value('existingPlacesGrouped', {
  All: ["All"]
});
app.value('currentPlace', {});
app.value('currentPosition', {
  lat: '',
  lng: '',
  radius: 2
});
app.value('appState',{
  ready: false,
  cordova: false,
  offline: false,
  mapReady: false,
  removeLoader: false,
  appActive: true
});
app.value('location', {
  lat: '',
  lng: ''
});

app.run(function($ionicPlatform, $rootScope, appState, location, $window, $state, connectivityMonitor, $cordovaGeolocation, popup) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  $rootScope.appState = appState;

  $ionicPlatform.ready(function() {

    if(connectivityMonitor.isOffline()){
      appState.offline = true;
    }

    $cordovaGeolocation.getCurrentPosition(options)
    .then(function(position){
      location.lat = position.coords.latitude;
      location.lng = position.coords.longitude;
    }, function(error){
      if(!appState.offline){
        popup.couldNotGetLocation();
      }
      location.lat = 37.773972;
      location.lng = -122.431297;
    })
    .then(function(){
      appState.ready = true;
    });

    connectivityMonitor.startWatching();

    if(window.cordova){

      appState.cordova = true;

      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        //cordova.plugins.Keyboard.disableScroll(true);
        cordova.plugins.Keyboard.disableScroll(false);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
      if (cordova.InAppBrowser) {
        window.open = cordova.InAppBrowser.open;
      }
    }
  });

  document.addEventListener("pause", function(){
    appState.appActive = false;
    console.log(appState.appActive);
  }, false);

  document.addEventListener("resume", function(){
    appState.appActive = true;
    console.log(appState.appActive);
  }, false);
});

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
    controller: 'MapCtrl',
  })
  .state('edit', {
    url: '/edit',
    templateUrl: 'templates/edit.html',
    controller: 'editCtrl'
  })
  .state('offline', {
    cache: false,
    url: '/offline',
    templateUrl: 'templates/offline.html',
    controller: 'offlineCtrl'
  });

  $urlRouterProvider.otherwise("/map");
});



 










