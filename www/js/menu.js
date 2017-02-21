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
      //var promise = server.pageSetUp();
      //promise.then(
        //function(){
          mapScope.group  = existingPlaces.groups.sort();
          mapScope.type = existingPlaces.types.sort();
          popup.getPlaces(mapScope, map);
        //}
      //);
    },
    //Search based on location (if avaiable)
    searchByLocation: function(mapScope, map){
      var service;
      //if(!appState.offline){
        service = $injector.get('firebaseData');
      //}
      removePlacesFromList();
      map.setCenter({lat:currentPosition.lat, lng: currentPosition.lng});
      service.placesByLocation(currentPosition.lat, currentPosition.lng, currentPosition.radius, map);

      $ionicSideMenuDelegate.toggleLeft();
    },
    //Open the edit page and close any markers currently onscreen
    editPlaces: function(){
      removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('edit');
    },
    //Clear screen of previous searches
    removePlaces: function(){
      removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();
    },
    //Open the home screen
    logoutScreen: function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('home');
    },
    offline: function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('offline');
    }
  };
}]);