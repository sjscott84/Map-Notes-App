// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])
var placeObject = {};

app.run(function($ionicPlatform) {
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

app.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicPopup, $http, $ionicModal) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  var marker;
  var button = document.getElementById('button');

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
          Popup($scope, $ionicPopup, marker, $http);
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

  $scope.disableTap = function(){
    container = document.getElementsByClassName('pac-container');
    // disable ionic data tab
    angular.element(container).attr('data-tap-disabled', 'true');
    // leave input field if google-address-entry is selected
    angular.element(container).on("click", function(){
        document.getElementById('pac-input').blur();
    });
  };

});

app.controller('MenuCtrl', function($scope){
  $scope.tasks = [
    {title: 'Find places by location',},
    {title: 'Search for places'},
    {title: 'Remove current places'}
    ];
});


function Popup ($scope, $ionicPopup, marker, $http){
  // Triggered on a button click, or some other target
  //$scope.showPopup = function() {
  $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      //template: '<input type="password" ng-model="data.wifi">',
      title: placeObject.name,
      subTitle: "Do you want to save this place?",
      scope: $scope,
      buttons: [
        { text: 'Cancel',
          onTap: function(){
            marker.setMap(null);
          } 
        },
        {
          text: '<b>Save</b>',
          type: 'button-positive',
          onTap: function(e) {
            savePlacePopup($scope, $ionicPopup, marker, $http);
            
          }
        }
      ]
    });
  //};
};

function savePlacePopup ($scope, $ionicPopup, marker, $http){
  // Triggered on a button click, or some other target
  //$scope.showPopup = function() {
  $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<div class="list"><label class="item item-input item-floating-label"><span class="input-label">Group</span><input type="text" placeholder="Group" ng-model="data.group"></label>\
      <label class="item item-input item-floating-label"><span class="input-label">Type</span><input type="text" placeholder="Type" ng-model="data.type""></label>\
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
            placeObject.group = $scope.data.group;
            placeObject.type = $scope.data.type;
            placeObject.notes = $scope.data.notes;

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
  //};
};





