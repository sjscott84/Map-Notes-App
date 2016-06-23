var app = angular.module('starter')
  app.controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', 'popup', 'existingPlaces', 'currentPosition', 'firebaseAuth', 'menu', 'listView',
                  function($scope, $state, $cordovaGeolocation, popup, existingPlaces, currentPosition, firebaseAuth, menu, listView) {
    scope = $scope;
    var options = {timeout: 10000, enableHighAccuracy: true};
    var button = document.getElementById('button');
    var closeButton = document.getElementById('closeButton');
    var marker;
    var placeObject = {};
    var input;
    var searchBox;
    scope.matchingGroups = [];
    scope.matchingTypes = [];

    //Opens the map based on the coordinates passed in
    function openMap (lat, lng){

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
            map: scope.map,
            title: place.name,
            position: place.geometry.location
          });

          google.maps.event.addListener(marker, 'click', function() {
            popup.saveRequest(placeObject, scope, scope.map);
            marker.setMap(null);
          });

          if (place.geometry.viewport) {
          // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
          scope.map.setCenter(place.geometry.location);
          scope.map.fitBounds(bounds);
          var lat = place.geometry.location.lat();
          var lng = place.geometry.location.lng();
          placeObject = {"group": undefined, "name": place.name, "address":place.formatted_address, "latitude":lat, "longitude":lng, "type": undefined, "notes": undefined};
        });
      });

    }

    //Looks for current location and passes this to openMap, if can'g find location opens map in San Francisco
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      openMap(position.coords.latitude, position.coords.longitude);
    }, function(error){
      console.log(error);
      popup.couldNotGetLocation();
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
            //console.log(existingPlaces.groups[i]);
            scope.matchingTypes.push(existingPlaces.types[i]);
        }
      }
    }

    //Not sure what this is for....
    scope.closeList = function(){
      scope.matchingGroups = [];
      scope.matchingTypes = [];
    }

    //Not sure what this is for
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
      {title: 'Location',
      func: 'searchByLocation'},
      {title: 'Catagories',
      func: 'searchByWhat'},
      {title: 'Remove',
      func: 'removePlaces'},
      {title: 'Edit',
      func: 'editPlaces'},
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
app.factory('menu',['listView','$ionicSideMenuDelegate', 'existingPlaces', 'popup', 'currentPosition', 'firebaseData', '$state', function(listView, $ionicSideMenuDelegate, existingPlaces, popup, currentPosition, firebaseData, $state){
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
      $ionicSideMenuDelegate.toggleLeft();
      //var promise = server.pageSetUp();
      //promise.then(
        //function(){
          mapScope.group  = existingPlaces.groups;
          mapScope.type = existingPlaces.types;
          popup.getPlaces(mapScope, map);
        //}
      //);
    },
    //Search based on location (if avaiable)
    //TODO: Add error handling when location is not available
    searchByLocation: function(mapScope, map){
      removePlacesFromList();
      firebaseData.placesByLocation(currentPosition.lat, currentPosition.lng, currentPosition.radius, map);
      $ionicSideMenuDelegate.toggleLeft();
    },
    //Open the edit page
    editPlaces: function(){
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
    }
  }
}])