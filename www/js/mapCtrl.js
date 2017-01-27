var app = angular.module('starter')
  app.controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', 'popup', 'existingPlaces', 'existingPlacesGrouped', 'currentPosition', 'menu', 'listView', '$state', 'appState',
                  function($scope, $state, $cordovaGeolocation, popup, existingPlaces, existingPlacesGrouped, currentPosition, menu, listView, $state, appState) {
    scope = $scope;
    var options = {timeout: 10000, enableHighAccuracy: true};
    var button = document.getElementById('button');
    var closeButton = document.getElementById('closeButton');
    var marker;
    var allMarkers = [];
    var placeObject = {};
    var input;
    var searchBox;
    var isDeviceOnline = navigator.onLine;
    scope.matchingGroups = [];
    scope.matchingTypes = [];

    //Opens the map based on the coordinates passed in
    function openMap (lat, lng){

      /*if(!isDeviceOnline){
        appState.offline = true;
        popup.offlineMessage();
        $state.go('offline');
      }else{*/
        //appState.offline = false;
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
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);

        // Create the search box and link it to the UI element.
        input = document.getElementById('pac-input');
        searchBox = new google.maps.places.SearchBox(input);
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
        scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(closeButton);
        //Bias the SearchBox results towards current map's viewport.
        scope.map.addListener('bounds_changed', function() {
          searchBox.setBounds(scope.map.getBounds());
        });

        google.maps.event.addListenerOnce(scope.map, 'idle', function(){
          appState.mapReady = true;
        });
        // Listen for the event fired when the user selects a prediction,
        // removes any existing search history and
        // retrieves more details for that place.
        searchBox.addListener('places_changed', function() {
          var allMarkers = [];
          var places = searchBox.getPlaces();
          if (places.length === 0) {
            return;
          }
          // Clear out the old marker
          if(marker || allMarkers.length > 0){
            marker.setMap(null);
            for(i = 0; i < allMarkers.length; i++){
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
              for(i = 0; i < allMarkers.length; i++){
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
      //}
    }

    //Looks for current location and passes this to openMap, if can't find location opens map in San Francisco
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      openMap(position.coords.latitude, position.coords.longitude);
    }, function(error){
      //console.log(error);
      if(isDeviceOnline){
        popup.couldNotGetLocation();
      }
      openMap(37.773972, -122.431297);
    });

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
    }

    //Updates the types that display on screen that match the search term
    scope.getTypes = function() {
      if(scope.data.type.length !== 0){
        var entry = scope.data.type.length;
      }
      scope.matchingTypes = [];
      for(var i = 1; i<existingPlaces.types.length; i++){
          var what = existingPlaces.types[i].slice(0, entry);
          if(scope.data.type.match(new RegExp([what], 'i'))){
            scope.matchingTypes.push(existingPlaces.types[i]);
        }
      }
    }

    //Closes the "autocomplete" dropdown list once an option has been selected when creating a new entry
    scope.closeList = function(){
      scope.matchingGroups = [];
      scope.matchingTypes = [];
    }

    scope.disableTap = function(){
      container = document.getElementsByClassName('pac-container');
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
    }

    //Resets the search box
    scope.emptySearch = function(){
      document.getElementById("pac-input").value = "";
      if(marker){
        marker.setMap(null);
      }
    }
  }]);

//Functions based on the items in the side menu
app.factory('menu',['listView','$ionicSideMenuDelegate', 'existingPlaces', 'existingPlacesGrouped', 'popup', 'currentPosition', '$injector', '$state', 'allPlaces', 'appState', function(listView, $ionicSideMenuDelegate, existingPlaces, existingPlacesGrouped, popup, currentPosition, $injector, $state, allPlaces, appState){
  //Clear the screen of previous searches
  removePlacesFromList = function(){
    while(listView.length !== 0){
      var x = listView.pop();
      x.marker.setMap(null);
    }
  }; 

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
  }
}])