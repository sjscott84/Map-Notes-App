'use strict';
angular.module('starter')  
  .controller('offlineCtrl',['$scope', '$state', 'appState', '$window', 'allPlaces', 'popup', function($scope, $state, appState, $window, allPlaces, popup){

    var toParse = localStorage.getItem('places');
    $scope.tempList = JSON.parse(toParse);
    $scope.list = [];

    //Sorts data into group and type for display purposes
    for(var i = 0; i < $scope.tempList.length; i++){
      var placeObject = {name: $scope.tempList[i].name};
      var places = $scope.tempList[i].items;
      var tempTypes = [];
      for(var j = 0; j < places.length; j++){
        var placeItem = {name: places[j].name, address: places[j].address, notes: places[j].notes};
        if(tempTypes.indexOf(places[j].type) === -1){
          tempTypes.push(places[j].type);
          placeObject[places[j].type] = [];
          placeObject[places[j].type].push(placeItem);
        }else{
          placeObject[places[j].type].push(placeItem);
        }
      }
      $scope.list.push(placeObject);
    }

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
        $scope.shownType = null;
        $scope.shownPlace = null;
      } else {
        $scope.shownGroup = group;
      }
    };

    $scope.toggleType = function(type) {
      if ($scope.isTypeShown(type)) {
        $scope.shownType = null;
        $scope.shownPlace = null;
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

    $scope.isTypeShown = function(type){
      return $scope.shownType === type;
    };

    $scope.isTypeAndGroup = function (key, thing){
      if($scope.shownType === key && $scope.shownGroup === thing){
        return true;
      }else{
        return false;
      }
    }

    $scope.returnToMap = function(){
      if(appState.mapReady && !appState.offline){
        $state.go('map');
      }else if(appState.offline){
        popup.offlineMessage();
      }else if(!appState.mapReady && !appState.offline){
        $state.go('map');
        window.setTimeout(function() {
          location.reload();
        }, 200);
      }
    };
  }]);