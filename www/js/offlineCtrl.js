var app = angular.module('starter')  
  app.controller('offlineCtrl',['$scope', '$state', 'appState', '$window', 'allPlaces', function($scope, $state, appState, $window, allPlaces){

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
    }

    $scope.returnToMap = function(){
      if(appState.mapReady){
        $state.go('map');
      }else{
        $state.go('map');
        $window.location.reload();
      }
    }
  }]);