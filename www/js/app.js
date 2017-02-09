var app = angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngCordova'])

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
})
app.value('appState',{
  ready: false,
  cordova: false,
  offline: true,
  mapReady: false,
  removeLoader: false,
  appActive: true
});

app.run(function($ionicPlatform, $rootScope, appState, $window, $state, ConnectivityMonitor) {
  $rootScope.appState = appState;

  $ionicPlatform.ready(function() {

    appState.ready = true;

    if(ConnectivityMonitor.isOnline()){
      appState.offline = false;
    }

    ConnectivityMonitor.startWatching();

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
        window.open = cordova.InAppBrowser.open
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

  //Functionality too test if internet available and change app state accordingly. In testing this was super buggy so has been disabeled for now.
  /*$window.addEventListener("offline", function () {
    if(appState.appActive){
      $rootScope.$apply(function() {
        appState.offline = true;
        popup.offlineMessage();
        $state.go('offline');
      });
    }
  }, false);
  $window.addEventListener("online", function () {
    if(appState.appActive){
      $rootScope.$apply(function() {
        appState.offline = false;
        popup.onlineMessage();
      });
    }
  }, false);*/
})

app.config(function($stateProvider, $urlRouterProvider) {
  console.log('app.config called');
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
  //$urlRouterProvider.otherwise("/home");
})

app.factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork, appState, popup){
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
      } else {
        return navigator.onLine;
      }
    },
    isOffline: function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
      } else {
        return !navigator.onLine;
      }
    },
    startWatching: function(){
        if(ionic.Platform.isWebView()){
 
          $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
            appState.offline = false;
          });
 
          $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
            if(!appState.offline){
              appState.offline = true;
              popup.offlineMessageNew();
            }
          });
 
        }else {
 
          window.addEventListener("online", function(e) {
            appState.offline = false;
          }, false);
 
          window.addEventListener("offline", function(e) {
            if(!appState.offline){
              appState.offline = true;
              popup.offlineMessageNew();
            }
          }, false);
        
      }
    }
  }
})



 










