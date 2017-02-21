'use strict';
angular.module('starter')  
  .controller('offlineCtrl',['$scope', '$state', 'appState', '$window', 'allPlaces', 'popup', function($scope, $state, appState, $window, allPlaces, popup){

    var toParse = localStorage.getItem('places');
    $scope.list = JSON.parse(toParse);

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
        $scope.shownPlace = null;
      } else {
        $scope.shownGroup = group;
      }
    };

    $scope.togglePlace = function(place) {
      if ($scope.isPlaceShown(place)) {
        $scope.shownPlace = null;
      } else {
        $scope.shownPlace = place;
      }
    };

    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };

    $scope.isPlaceShown = function(place){
      return $scope.shownPlace === place;
    };

    $scope.returnToMap = function(){
      if(appState.mapReady && !appState.offline){
        $state.go('map');
      }else if(appState.offline){
        popup.offlineMessage();
      }else if(!appState.mapReady && !appState.offline){
        $state.go('map');
        $window.location.reload();
      }
    };
  }]);