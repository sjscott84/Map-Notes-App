// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

app.value('placeObject', {});
app.value('listView', []);
app.value('existingPlaces', {
  groups: [],
  types: []
});
app.value('currentPlace', undefined);

//Place Constructor
var Place = function (map, name, position, lat, lng, type, note, address){
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
    addInfoWindow(self.map, self.name, self.address, self.type, self.note, self.marker);
    currentPlace = self;
    //map.setCenter(self.marker.getPosition());
  });
};

addInfoWindow = function(map, name, address, type, note, marker){

    var contents;

    if(infoWindow){
      infoWindow.close();
    }

    listView.forEach(function(place){
        contents = '<div class="infowindow"><b>'+name+'</b><br>'+address+'<br><b>What: </b>'+type+'<br><b>Notes: </b>'+note+'<br><a onclick="openGoogleMap()">View on google maps</a></div>';
    });

    infoWindow.setContent(contents);
    infoWindow.open(map, marker);
};

openGoogleMap = function(){
    var lat = currentPlace.position.lat;
    var lng = currentPlace.position.lng;

    window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng);
};

app.run( function($ionicPlatform, $http, existingPlaces) {
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

  $http({
    method: 'GET',
    url: 'http://thescotts.mynetgear.com:3000/pageSetUp'
  }).then(function successCallback(response) {
    console.log(response.data.groups);
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

app.controller('MapCtrl', ['$scope', '$state', '$cordovaGeolocation', '$ionicPopup', '$http', '$ionicModal', 'placeObject', 'listView',
                function($scope, $state, $cordovaGeolocation, $ionicPopup, $http, $ionicModal, placeObject, listView) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  var button = document.getElementById('button');
  var marker;
  var infoWindow

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(button);

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
          var myPopup = $ionicPopup.show({
            title: placeObject.name,
            subTitle: "Do you want to save this place?",
            buttons: [
              { text: 'Cancel',
                onTap: function(){
                } 
              },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  $scope.data = {};
                  var myPopup = $ionicPopup.show({
                  template: '<div class="list"><label class="item item-input item-floating-label"><span class="input-label">Group</span><input type="text" placeholder="Group" ng-model="data.group"></label>\
                            <ul class="list"><li class="item" ng-repeat="group in groups">{{group}}</li></ul>\
                            <label class="item item-input item-floating-label"><span class="input-label">Type</span><input type="text" placeholder="Type" ng-model="data.type"></label>\
                            <label class="item item-input item-floating-label"><span class="input-label">Note</span><input type="text" placeholder="Note" ng-model="data.notes"></label></div>',
                  title: placeObject.name,
                  scope: $scope,
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
                        placeObject.name = $scope.data.group;
                        placeObject.type = $scope.data.type;
                        placeObject.notes = $scope.data.notes;

                        listView.push(new Place($scope.map, placeObject.name, placeObject.position, placeObject.latitude, placeObject.longitude, placeObject.type, placeObject.notes, placeObject.address));

                        $http({
                          method: 'POST',
                          url: 'http://thescotts.mynetgear.com:3000/writeFile',
                          data: JSON.stringify(placeObject)
                        }).then(function successCallback(response) {
                            console.log("Succefully Saved");
                        }, function errorCallback(response) {
                            console.log(response);
                        });
                      }
                    }
                  ]
                });
                }
              }
            ]
          });
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
      console.log(placeObject);
      });
    });

    infoWindow = new google.maps.InfoWindow({
      disableAutoPan: true
    });

  }, function(error){
    console.log("Could not get location");
  });

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

app.controller('MenuCtrl', function($scope){
  $scope.tasks = [
    {title: 'Find places by location',},
    {title: 'Search for places'},
    {title: 'Remove current places'}
    ];
});








