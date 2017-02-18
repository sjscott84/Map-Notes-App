'use strict';
angular.module('starter')
  .factory('connectivityMonitor', ['$rootScope', '$cordovaNetwork', 'appState', 'popup', function($rootScope, $cordovaNetwork, appState, popup){
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
    };
  }]);