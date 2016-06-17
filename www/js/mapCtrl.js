angular.module('starter')
  .controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', 'popup', 'existingPlaces', 'currentPosition', 'firebaseAuth',
                  function($scope, $state, $cordovaGeolocation, popup, existingPlaces, currentPosition, firebaseAuth) {
    var options = {timeout: 10000, enableHighAccuracy: true};
    var button = document.getElementById('button');
    var marker;
    //var infoWindow;
    var placeObject = {};
    $scope.matchingGroups = [];
    $scope.matchingTypes = [];

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      currentPosition.lat = position.coords.latitude;
      currentPosition.lng = position.coords.longitude;

      var mapOptions = {
        center: latLng,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
      $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);

      map = $scope.map;

      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new google.maps.places.SearchBox(input);
      $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
      //Bias the SearchBox results towards current map's viewport.
      $scope.map.addListener('bounds_changed', function() {
        searchBox.setBounds($scope.map.getBounds());
      });

      google.maps.event.addListenerOnce(map, 'idle', function(){
      console.log("Loaded");
  });
      // Listen for the event fired when the user selects a prediction,
      // removes any existing search history and
      // retrieves more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length === 0) {
          return;
        }
        // Clear out the old marker
        if(marker){
          marker.setMap(null);
        }
        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();

        places.forEach(function(place) {
        // Create a marker for each place.
          marker = new google.maps.Marker({
            map: $scope.map,
            title: place.name,
            position: place.geometry.location
          });

          google.maps.event.addListener(marker, 'click', function() {
            popup.saveRequest(placeObject, $scope);
            marker.setMap(null);
          });

          if (place.geometry.viewport) {
          // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
          $scope.map.setCenter(place.geometry.location);
          $scope.map.fitBounds(bounds);
          var lat = place.geometry.location.lat();
          var lng = place.geometry.location.lng();
          placeObject = {"group": undefined, "name": place.name, "address":place.formatted_address, "latitude":lat, "longitude":lng, "type": undefined, "notes": undefined};
        });
      });

    }, function(error){
      console.log("Could not get location");
    });

    $scope.getGroups = function() {
      if($scope.data.group.length !== 0){
        var entry = $scope.data.group.length;
      }
      $scope.matchingGroups = [];
      for(var i = 1; i<existingPlaces.groups.length; i++){
          var what = existingPlaces.groups[i].slice(0, entry);
          if($scope.data.group.match(new RegExp([what], 'i'))){
            //console.log(existingPlaces.groups[i]);
            $scope.matchingGroups.push(existingPlaces.groups[i]);
        }
      }
    }

    $scope.getTypes = function() {
      if($scope.data.type.length !== 0){
        var entry = $scope.data.type.length;
      }
      $scope.matchingTypes = [];
      for(var i = 1; i<existingPlaces.types.length; i++){
          var what = existingPlaces.types[i].slice(0, entry);
          if($scope.data.type.match(new RegExp([what], 'i'))){
            //console.log(existingPlaces.groups[i]);
            $scope.matchingTypes.push(existingPlaces.types[i]);
        }
      }
    }

    $scope.closeList = function(){
      $scope.matchingGroups = [];
      $scope.matchingTypes = [];
    }

    $scope.disableTap = function(){
      container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){
          document.getElementById('pac-input').blur();
      });
    };
  }]);