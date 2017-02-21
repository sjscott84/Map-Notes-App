'use strict';
angular.module('starter')
  //Change the map bounds based on the markers on the screen
  .factory('fitBounds', function(){
    function zoomControl(map){
      var zoom = map.getZoom();
      map.setZoom(zoom > 15 ? 15 : zoom);
    }
    return {
      fitBoundsToVisibleMarkers: function(listView, map){
        var bounds = new google.maps.LatLngBounds();

        for (var i=0; i<listView.length; i++) {
          if(listView[i].marker.getVisible()) {
            bounds.extend(listView[i].marker.getPosition() );
          }
        }
        map.fitBounds(bounds);
        zoomControl(map);
      }
    };
  });