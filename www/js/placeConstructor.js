'use strict';
angular.module('starter')
  .factory('placeConstructor', ['$cordovaAppAvailability', '$compile', 'changeCurrentPlace', function($cordovaAppAvailability, $compile, changeCurrentPlace){
      var infoWindow;
      var content = document.getElementById("infoWindow");
      function chooseIcon(visited){
        if(!visited){
          return 'img/star_gold_16.png';
        }else{
          return 'img/red_circle_12.png';
        }
      }
      return{
        Place: function (name, lat, lng, type, note, address, group, visited, key, map){
          var self = this;
          self.visited = visited;
          self.group = group;
          self.map = map;
          self.name = name;
          self.lat = lat;
          self.lng = lng;
          self.type = type;
          self.note = note;
          self.address = address;
          self.uid = key;
          self.position = {"lat":self.lat, "lng":self.lng};
          self.marker = new google.maps.Marker({
            map: map,
            title: name,
            icon: {
              url: chooseIcon(self.visited),
              origin: new google.maps.Point(0,0),
              anchor: new google.maps.Point(15,15)
            },
            position: self.position,
            zoomOnClick: false,
          });
          google.maps.event.addListener(this.marker, 'click', function() {
            if(infoWindow){
              infoWindow.close();
            }
            //infoWindow = (!appState.offline) ? new google.maps.InfoWindow() : '';
            infoWindow = new google.maps.InfoWindow();
            changeCurrentPlace.changePlace(self);
            infoWindow.setContent(content);
            infoWindow.open(self.map, self.marker);
            //map.setCenter(self.marker.getPosition());
          });
        }
      };
  }]);