'use strict';
angular.module('starter')  
  .controller('offlineCtrl',['$scope', '$state', 'appState', '$window', 'allPlaces', 'popup', function($scope, $state, appState, $window, allPlaces, popup){

    var toParse = localStorage.getItem('places');
    $scope.tempList = JSON.parse(toParse);
    $scope.list = [];

    for(var i = 0; i < $scope.tempList.length; i++){
      var placeObject = {name: $scope.tempList[i].name};
      var places = $scope.tempList[i].items;
      for(var j = 0; j < places.length; j++){
        var tempTypes = [];
        var placeItem = {name: places[j].name, address: places[j].address, notes: places[j].notes, type: places[j].type}
        if(tempTypes.indexOf(places[j].type) === -1){
          tempTypes.push(places[j].type);
          placeObject[places[j].type] = placeItem;
        }else{
          placeObject[places[j].type] = placeItem;
        }
      }
      $scope.list.push(placeObject);
    }

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
        $scope.shownPlace = null;
      } else {
        $scope.shownGroup = group;
      }
    };

    $scope.toggleType = function(type) {
      if ($scope.isTypeShown(type)) {
        $scope.shownType = null;
      } else {
        $scope.shownType = type;
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

    $scope.isTypeShown = function(type, group){
      return $scope.shownType === type;
    };

    $scope.isTypeAndGroup = function(type, group){
      if($scope.shownType === type && $scope.shownGroup === group){
        return true;
      }else{
        return false;
      }
    };

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