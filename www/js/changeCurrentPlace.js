'use strict';
angular.module('starter')
  //Update the currentPlace when a new marker is clicked
	.factory('changeCurrentPlace',['$timeout', 'currentPlace', function($timeout, currentPlace){
    return {
      changePlace: function(place){
        $timeout(function(){
          console.log(place)
          currentPlace.group = place.group;
          currentPlace.name = place.name;
          currentPlace.address = place.address;
          currentPlace.note = place.note;
          currentPlace.type = place.type;
          currentPlace.lat = place.lat;
          currentPlace.lng = place.lng;
          currentPlace.uid = place.uid;
        }, 0);
      }
    };
  }]);