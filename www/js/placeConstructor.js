angular.module('starter')
  .factory('placeConstructor', ['$cordovaAppAvailability', '$compile', 'changeCurrentPlace', 'appState', function($cordovaAppAvailability, $compile, changeCurrentPlace, appState){
    //var infoWindow = new google.maps.InfoWindow();
    var infoWindow;
    var markerImage = {
      url: 'img/star_gold_16.png',
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(15,15)
    }
    //var infoWindow = (appState.online) ? 'online' : 'not online';
    //console.log(infoWindow)
    var content = document.getElementById("infoWindow");
    return{
      Place: function (name, lat, lng, type, note, address, key, map){
        var self = this;
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
          //icon: 'img/star_gold_16.png',
          icon: markerImage,
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
    }
  }])