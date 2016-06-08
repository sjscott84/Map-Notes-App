// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

var map;

app.value('listView', []);
app.value('existingPlaces', {
  groups: ["All"],
  types: ["All"]
});
app.value('currentPlace', {});
app.value('currentPosition', {
  lat: '',
  lng: '',
  radius: 2
})

//Place Constructor
app.factory('placeConstructor', ['$cordovaAppAvailability', '$compile', 'changeCurrentPlace', function($cordovaAppAvailability, $compile, changeCurrentPlace){
  var infoWindow = new google.maps.InfoWindow({
    disableAutoPan: false
  });
  var content = document.getElementById("infoWindow");
  return{
    Place: function (name, position, lat, lng, type, note, address){
      var self = this;
      self.map = map;
      self.name = name;
      self.lat = lat;
      self.lng = lng;
      self.type = type;
      self.note = note;
      self.address = address;
      self.position = {"lat":self.lat, "lng":self.lng};
      self.marker = new google.maps.Marker({
        map: map,
        title: name,
        icon: 'img/star_gold_16.png',
        position: self.position,
        zoomOnClick: false,
      });
      google.maps.event.addListener(this.marker, 'click', function() {
        changeCurrentPlace.changePlace(self);
        infoWindow.setContent(content);
        infoWindow.open(self.map, self.marker);       
        //map.setCenter(self.marker.getPosition());
      });
    }
  }
}])

app.factory('changeCurrentPlace',['$timeout', 'currentPlace', function($timeout, currentPlace){
  return {
    changePlace: function(place){
      $timeout(function(){
        currentPlace.name = place.name;
        currentPlace.address = place.address;
        currentPlace.note = place.note;
        currentPlace.type = place.type;
        currentPlace.lat = place.lat;
        currentPlace.lng = place.lng;
      }, 0);
    }
  }
}])

app.directive('info',['$cordovaAppAvailability', 'currentPlace', function($cordovaAppAvailability, currentPlace){
  return {
    scope: {
      place:  '=places'
    },
    template: '<div class="infowindow"><b>{{place.name}}</b><p>{{place.address}}</p><p>Type: {{place.type}}</p><p>Note: {{place.note}}</p><a ng-click="openNewMap()"">View On Google Maps</a></div>',
    link: function(scope, element, attrs) {
      scope.openNewMap = function(){
        console.log("Click click");
        //$cordovaAppAvailability.check('comgooglemaps://')
        //.then(function(){
        //do somethng if app avaliable
        //}, function(){
          var lat = currentPlace.lat;
          var lng = currentPlace.lng;

          window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng);
        //});
      }
    }
  }
}])

app.run( function($ionicPlatform, $http, existingPlaces, server) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
    server.pageSetUp();

})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");
})

app.controller('MainCtrl', ['$scope', 'currentPlace', function($scope, currentPlace){
  $scope.$watchCollection(
    function(){
      return currentPlace;
    },
    function(newVal, oldVal){
      if(newVal !== oldVal){
        $scope.thisplace = currentPlace;
      }else{
        console.log('No Change');
      }
    },true);
}])

app.controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', 'server', 'popup', 'existingPlaces', 'currentPosition',
                function($scope, $state, $cordovaGeolocation, server, popup, existingPlaces, currentPosition) {
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
        placeObject = {"group": undefined, "name": place.name, "address":place.formatted_address, "location":place.geometry.location, "latitude":place.geometry.location.lat(), "longitude":place.geometry.location.lng(), "type": undefined, "notes": undefined};
      });
    });

  }, function(error){
    console.log("Could not get location");
  });

  $scope.getGroups = function() {
    var entry = $scope.data.group.length;
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
    var entry = $scope.data.type.length;
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


app.controller('MenuCtrl', ['$scope', '$ionicSideMenuDelegate', 'popup', 'server', 'listView', 'fitBounds', 'existingPlaces', function($scope, $ionicSideMenuDelegate, popup, server, listView, fitBounds, existingPlaces){
  $scope.tasks = [
    {title: 'Find places by location',
    func: 'searchByLocation'},
    {title: 'Search for places',
    func: 'searchByWhat'},
    {title: 'Remove current places',
    func: 'removePlaces'}
  ];

  $scope.searchByWhat = function(){
    $scope.removePlacesFromList();
    $ionicSideMenuDelegate.toggleLeft();
    var promise = server.pageSetUp();
    promise.then(
      function(){
        $scope.group  = existingPlaces.groups;
        $scope.type = existingPlaces.types;
        popup.getPlaces($scope);
      }
    );
  };

  $scope.searchByLocation = function(){
    $scope.removePlacesFromList();
    server.resultsByLocation();
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.removePlaces = function(){
    $scope.removePlacesFromList();
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.removePlacesFromList = function(){
    while(listView.length !== 0){
      var x = listView.pop();
      x.marker.setMap(null);
    }
  };
}]);

app.factory('server', ['$http', 'existingPlaces', 'listView', 'currentPosition', 'fitBounds', 'placeConstructor', function($http, existingPlaces, listView, currentPosition, fitBounds, placeConstructor){
  return {
    pageSetUp: function(){
      return $http({
        method: 'GET',
        url: 'http://thescotts.mynetgear.com:3000/pageSetUp'
      }).then(function successCallback(response) {
          if(existingPlaces.groups.length > 1 || existingPlaces.types.length > 1){
            while(existingPlaces.groups.length !== 1){
              existingPlaces.groups.pop();
            }
            while(existingPlaces.types.length !== 1){
              existingPlaces.types.pop();
            }
          }
          for(var i=0; i<response.data.groups.length; i++){
            existingPlaces.groups.push(response.data.groups[i]);
          }
          for(var i=0; i<response.data.types.length; i++){
            existingPlaces.types.push(response.data.types[i]);
          }
          existingPlaces.groups.sort();
          existingPlaces.types.sort();
        }, function errorCallback(response) {
          console.log(response);
        });
      },
    savePlace: function(placeObject){
      $http({
        method: 'POST',
        url: 'http://thescotts.mynetgear.com:3000/writeFile',
        data: JSON.stringify(placeObject)
      }).then(function(response) {
          console.log("Succefully Saved");
      }, function(response) {
          console.log(response);
      });
    },
    resultsByLocation: function(){
      var data = {"lat" : currentPosition.lat, "lng": currentPosition.lng, "distance": currentPosition.radius};
      $http({
        method: 'GET',
        url: 'http://thescotts.mynetgear.com:3000/readFileForRadius',
        params: data
      }).then(function(response){
        if(response.data.length !== 0){
          response.data.forEach(function(value){
            listView.push(new placeConstructor.Place(value.name, value.location, value.latitude, value.longitude, value.type, value.notes, value.address));
            //fitBounds.fitBoundsToVisibleMarkers(listView);
            //var zoom = map.getZoom();
              //map.setZoom(zoom > 15 ? 15 : zoom);
          });
          fitBounds.fitBoundsToVisibleMarkers(listView);
        }else{
          alert("Error, no results found, please try again");
        }
      }), function(response){
            console.log(response);
      }
    },
    searchForPlaces: function(group, type){
      var data = {"group" : group, "type" : type};
      $http({
        method: 'GET',
        url: 'http://thescotts.mynetgear.com:3000/readFileForGroup',
        params: data
      }).then(function(response){
        if(response.data.length !== 0){
          response.data.forEach(function(value){
            listView.push(new placeConstructor.Place(value.name, value.location, value.latitude, value.longitude, value.type, value.notes, value.address));
            //fitBounds.fitBoundsToVisibleMarkers(listView);
            //var zoom = map.getZoom();
              //map.setZoom(zoom > 15 ? 15 : zoom);
          });
          fitBounds.fitBoundsToVisibleMarkers(listView);
        }else{
          alert("Error, no results found, please try again");
        }
      }), function(response){
            console.log(response);
      }
    }
  }
}]);

app.factory('popup', ['$ionicPopup', 'server', 'listView', 'placeConstructor', function($ionicPopup, server, listView, placeConstructor){
  function inputPlaceInfoFn(placeObject, mapScope){
    mapScope.data = {};
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/popup.html',
      title: placeObject.name,
      scope: mapScope,
      buttons: [
        { text: 'Cancel',
          onTap: function(){
            placeObject = {};
          }
        },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            placeObject.group = mapScope.data.group;
            placeObject.type = mapScope.data.type;
            placeObject.notes = mapScope.data.notes;

            listView.push(new placeConstructor.Place(placeObject.name, placeObject.position, placeObject.latitude, placeObject.longitude, placeObject.type, placeObject.notes, placeObject.address));

            server.savePlace(placeObject);
          }
        }
      ]
    })
  }
  return {
    saveRequest: function(placeObject, mapScope){
      var myPopup = $ionicPopup.show({
        title: placeObject.name,
        subTitle: "Do you want to save this place?",
        scope : mapScope,
        buttons: [
          { text: 'Cancel',
            onTap: function(){
            } 
          },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function() {
              inputPlaceInfoFn(placeObject, mapScope);
            }
          }
        ]
      })
    },
    getPlaces: function(scope){
      scope.data = {};
      var myPopup = $ionicPopup.show({
        templateUrl: 'templates/findPlaces.html',
        title: 'Find Places By Location',
        scope: scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(){
            } 
          },
          {
            text: 'Retrieve Places',
            type: 'button-positive',
            onTap: function() {
              server.searchForPlaces(scope.data.selectedGroup, scope.data.selectedType);
            }
          }
        ]
      })
    }
  }
}]);

app.factory('fitBounds', function(){
  return {
    fitBoundsToVisibleMarkers: function(listView){
      var bounds = new google.maps.LatLngBounds();

      for (var i=0; i<listView.length; i++) {
        if(listView[i].marker.getVisible()) {
          bounds.extend(listView[i].marker.getPosition() );
        }
      }
      map.fitBounds(bounds);
    }
  }
});









