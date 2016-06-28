var app = angular.module('starter')  
  app.controller('offlineCtrl',['$scope', '$state', 'allPlaces', 'popup', 'editPage', function($scope, $state, allPlaces, popup, editPage){

    var toParse = localStorage.getItem('places');
    $scope.list = JSON.parse(toParse);

    $scope.returnToMap = function(){
      $state.go('map');
    }

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
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
  }]);