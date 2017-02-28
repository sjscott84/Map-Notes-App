'use strict';
angular.module('starter')  
  .controller('instructionsCtrl',['$scope', '$state', 'appState', function($scope, $state, appState){

    $scope.returnToMap = function(){
      if(appState.mapReady && !appState.offline){
        $state.go('map');
      }else if(appState.offline){
        popup.offlineMessage();
      }else if(!appState.mapReady && !appState.offline){
        $state.go('map');
        location.reload();
      }
    };
    
  }]);