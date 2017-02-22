'use strict';
angular.module('starter')
  .controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', 'popup', 'existingPlaces', 'existingPlacesGrouped', 'currentPosition', 'menu', 'listView', 'appState', 'location',
                  function($scope, $state, $cordovaGeolocation, popup, existingPlaces, existingPlacesGrouped, currentPosition, menu, listView, appState, location) {
    var scope = $scope;
    var button = document.getElementById('button');
    var closeButton = document.getElementById('closeButton');
    var marker;
    var allMarkers = [];
    var placeObject = {};
    var input;
    var searchBox;
    scope.matchingGroups = [];
    scope.matchingTypes = [];

    scope.$watch(function () {
       return appState.ready;
     },
      function(newVal, oldVal) {
        if(newVal !== oldVal && newVal === true){
          openMap(location.lat, location.lng);
        }
    }, true);

    //Opens the map based on the coordinates passed in
    function openMap (lat, lng){

      if(appState.offline && !appState.mapReady){
        $state.go('offline');
        popup.offlineMessage();
        appState.removeLoader = true;
      }else{
        var latLng = new google.maps.LatLng(lat, lng);

        currentPosition.lat = lat;
        currentPosition.lng = lng;

        var mapOptions = {
          center: latLng,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
        //scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);

        // Create the search box and link it to the UI element.
        input = document.getElementById('pac-input');
        searchBox = new google.maps.places.SearchBox(input);
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(closeButton);
        //Bias the SearchBox results towards current map's viewport.
        scope.map.addListener('bounds_changed', function() {
          searchBox.setBounds(scope.map.getBounds());
        });

        google.maps.event.addListenerOnce(scope.map, 'idle', function(){
          appState.removeLoader = true;
          appState.mapReady = true;
        });

        //var infowindow = new google.maps.InfoWindow();

        scope.map.addListener('click', function(event){
          //infowindow.close();
          if(event.placeId){
            event.stop();
            var request = {
              placeId: event.placeId
            };
            var service = new google.maps.places.PlacesService(scope.map);
            service.getDetails(request, callback);
            function callback(place, status){
              scope.map.setCenter(place.geometry.location);
              placeObject = {"group": undefined, "name": place.name, "address":place.formatted_address, "latitude":place.geometry.location.lat(), "longitude":place.geometry.location.lng(), "type": undefined, "notes": undefined};
              popup.saveRequest(placeObject, scope, scope.map);
            } 
          }
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
          if(marker || allMarkers.length > 0){
            marker.setMap(null);
            for(var i = 0; i < allMarkers.length; i++){
              allMarkers[i].setMap(null);
            }
          }
          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();

          places.forEach(function(place) {
          // Create a marker for each place.
            marker = new google.maps.Marker({
              map: scope.map,
              title: place.name,
              position: place.geometry.location,
              address: place.formatted_address,
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            });

            google.maps.event.addListener(marker, 'click', function() {
              placeObject = {"group": undefined, "name": this.title, "address":this.address, "latitude":this.lat, "longitude":this.lng, "type": undefined, "notes": undefined};
              popup.saveRequest(placeObject, scope, scope.map);
              //marker.setMap(null);
              for(var i = 0; i < allMarkers.length; i++){
                allMarkers[i].setMap(null);
              }
            });

            if (place.geometry.viewport) {
            // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
            scope.map.setCenter(place.geometry.location);
            scope.map.fitBounds(bounds);

            allMarkers.push(marker);
          });
        });
      }
    }

    //Updates the groups that display on screen that match the search term
    scope.getGroups = function() {
      if(scope.data.group.length !== 0){
        var entry = scope.data.group.length;
      }
      scope.matchingGroups = [];
      for(var i = 1; i<existingPlaces.groups.length; i++){
          var what = existingPlaces.groups[i].slice(0, entry);
          if(scope.data.group.match(new RegExp([what], 'i'))){
            scope.matchingGroups.push(existingPlaces.groups[i]);
        }
      }
    };

    //Updates the types that display on screen that match the search term
    scope.getTypes = function() {
      if(scope.data.type.length !== 0){
        var entry = scope.data.type.length;
      }
      scope.matchingTypes = [];
      for(var i = 1; i<existingPlaces.types.length-1; i++){
          var what = existingPlaces.types[i].slice(0, entry);
          if(scope.data.type.match(new RegExp([what], 'i'))){
            scope.matchingTypes.push(existingPlaces.types[i]);
        }
      }
    };

    //Closes the "autocomplete" dropdown list once an option has been selected when creating a new entry
    scope.closeList = function(){
      scope.matchingGroups = [];
      scope.matchingTypes = [];
    };

    scope.disableTap = function(){
      var container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){
          document.getElementById('pac-input').blur();
      });
    };

    //List of items that display in the side menu
    scope.tasks = [
      {title: 'Search by Current Location',
      func: 'searchByLocation'},
      {title: 'Search by Catagories',
      func: 'searchByWhat'},
      {title: 'Remove Current Places',
      func: 'removePlaces'},
      {title: 'Edit Places',
      func: 'editPlaces'},
      {title: 'Offline',
      func: 'offline'},
      {title: 'Logout',
      func: 'logoutScreen'}
    ];

    //Calls a function based on what item was clicked in the side menu
    scope.getFunctions = function(task){
      var func = task.func;
      menu[func](scope, scope.map);
    };

    //Resets the search box
    scope.emptySearch = function(){
      document.getElementById("pac-input").value = "";
      if(marker){
        marker.setMap(null);
      }
    };
  }]);