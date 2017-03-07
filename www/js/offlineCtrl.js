'use strict';
angular.module('starter')
  .controller('offlineCtrl',['$scope', '$state', 'appState', '$window', 'allPlaces', 'popup', function($scope, $state, appState, $window, allPlaces, popup){

    var toParse = localStorage.getItem('places');
    $scope.tempList = JSON.parse(toParse);
    $scope.list = [];

    //Sorts data into group and type for display purposes
    //TODO: Can this be refactored??
    for(var i = 0; i < $scope.tempList.length; i++){
      var placeObject = {name: $scope.tempList[i].name, types: []};
      var places = $scope.tempList[i].items;
      var tempTypes = [];
      //Get a list of all the types
      for(var j = 0; j < places.length; j++){
        if(tempTypes.indexOf(places[j].type) === -1){
          tempTypes.push(places[j].type);
        }
      }
      //For each type create an object
      for(var k = 0; k < tempTypes.length; k++){
        var what = {typeName: tempTypes[k], places: []};
        placeObject['types'].push(what);
      }
      //For each place, add place to appropriate type object
      for(var l = 0; l < places.length; l++){
        var placeItem = {name: places[l].name, address: places[l].address, notes: places[l].notes, type: places[l].type};
        for(var m = 0; m < placeObject['types'].length; m++){
          if(places[l].type === placeObject['types'][m]['typeName']){
            placeObject['types'][m]['places'].push(placeItem);
          }
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

    $scope.isTypeAndGroup = function (type, place){
      if($scope.shownType === type && $scope.shownGroup === place){
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
        window.setTimeout(function() {
          location.reload();
        }, 200);
      }
    };
  }]);