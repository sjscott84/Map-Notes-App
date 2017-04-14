'use strict';
angular.module('starter')
//Functions based on the items in the side menu
 .factory('menu',['listView','$ionicSideMenuDelegate', 'existingPlaces', 'existingPlacesGrouped', 'popup', 'currentPosition', '$injector', '$state', function(listView, $ionicSideMenuDelegate, existingPlaces, existingPlacesGrouped, popup, currentPosition, $injector, $state){
  //Clear the screen of previous searches
  function removePlacesFromList (){
    while(listView.length !== 0){
      var x = listView.pop();
      x.marker.setMap(null);
    }
  }

  return{
    //Search by group and/or type
    searchByWhat: function(mapScope, map){
      removePlacesFromList();
      mapScope.getTypesForGroup = function(group){
        if(group != "All"){
          mapScope.type = existingPlacesGrouped[group].sort();
        }else{
          mapScope.type = existingPlaces.types.sort();
        }
      };
      $ionicSideMenuDelegate.toggleLeft();
        mapScope.group  = existingPlaces.groups.sort();
        mapScope.type = existingPlaces.types.sort();
        popup.getPlaces(mapScope, map);
    },
    //Search based on location (if avaiable)
    searchByLocation: function(mapScope, map, button, input, closeButton){
      map.controls[google.maps.ControlPosition.TOP_CENTER].clear();

      var service = $injector.get('firebaseData');
      removePlacesFromList();
      map.setCenter({lat:currentPosition.lat, lng: currentPosition.lng});
      service.placesByLocation(currentPosition.lat, currentPosition.lng, currentPosition.radius, map);

      $ionicSideMenuDelegate.toggleLeft();

      window.setTimeout(function() {
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(closeButton);
      }, 400);
    },
    //Open the edit page and close any markers currently onscreen
    editPlaces: function(){
      removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('edit');
    },
    //Clear screen of previous searches
    removePlaces: function(mapScope, map, button, input, closeButton){
      map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
      removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();

      window.setTimeout(function() {
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(closeButton);
      }, 400);
    },
    //Open the home screen
    logoutScreen: function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('home');
    },
    offline: function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('offline');
    },
    instructions: function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('instructions');
    }
  };
}]);