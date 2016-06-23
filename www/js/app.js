// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordovaOauth', 'ngCordova'])

app.value('listView', []);
app.value('allPlaces', []);
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
app.value('appState',{
  ready: false,
  cordova: false
});

app.run( function($ionicPlatform, $http, $rootScope, user, existingPlaces, firebaseData, firebaseService, appState) {
  $rootScope.user = user;
  $rootScope.appState = appState;
  window.appState = appState;

  $ionicPlatform.ready(function() {
    appState.ready = true;

    if(window.cordova){
      appState.cordova = true;

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
      if (cordova.InAppBrowser) {
        window.open = cordova.InAppBrowser.open
      }
    }
  });
    //firebaseData.pageSetUp();
    //firebaseData.getPlaces();
})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home',{
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  })
  .state('map', {
    url: '/map',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })
  .state('edit', {
    url: '/edit',
    templateUrl: 'templates/edit.html',
    controller: 'editCtrl'
  });

  $urlRouterProvider.otherwise("/home");
})

//Place Constructor
app.factory('placeConstructor', ['$cordovaAppAvailability', '$compile', 'changeCurrentPlace', function($cordovaAppAvailability, $compile, changeCurrentPlace){
  var infoWindow = new google.maps.InfoWindow({
    disableAutoPan: false
  });
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

//Update the currentPlace when a new marker is clicked
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
        currentPlace.uid = place.uid;
      }, 0);
    }
  }
}])

//Controls the content of the infowindow when a marker is clicked
app.directive('info',['$cordovaAppAvailability', 'currentPlace', 'firebaseData', function($cordovaAppAvailability, currentPlace, firebaseData){

  var name = currentPlace.name;

  /*changeNameForGoogleSearch = function(name){
    for(var i=0; i<name.length; i++){
      if(name[i] === ' '){
        name[i] = '+';
      }
    }
    console.log(name)
  };*/

  return {
    scope: {
      place:  '=places'
    },
    template: '<div class="infowindow"><div class="iw-title">{{place.name}}</div><div class="iw-info"><p>Type: {{place.type}}</p><p>Note: {{place.note}}</p><a ng-click="openNewMap()"">Navigation</a></div></div>',
    link: function(scope, element, attrs) {
      scope.openNewMap = function(){
        var lat = currentPlace.lat;
        var lng = currentPlace.lng;
        $cordovaAppAvailability.check('comgooglemaps://')
        .then(function(){
        var sApp = startApp.set('comgooglemaps://?q='+lat+'+'+lng+'&zoom=13');
        console.log("map avaliable")
        sApp.start(function() {
          console.log("OK");
        }, function(error) {
          alert(error);
        });
        })
        .catch(function(){
          $cordovaAppAvailability.check('http://maps.apple.com')
          .then(function(){
            console.log('Apple map avaliable')
            var sApp = startApp.set('http://maps.apple.com/?q='+lat+'+'+lng+'&z=13');
            sApp.start(function() {
              console.log("OK");
            }, function(error) {
              alert(error);
            });
          })
          .catch(function(){
            console.log("map not avaliable")
            window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng, "_blank");
          })
        });
      }
    }
  }
}])

//TODO: Why is this not in the popup factory????
app.factory('errorMessage',['$ionicPopup', function($ionicPopup){
  return{
    searchErrorAlert: function(){
       var alertPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'No results found please try a new search'
       });
    },
    locationErrorAlert: function(){
       var alertPopup = $ionicPopup.alert({
         title: 'Error',
         template: 'No results found for your location please try searching'
       });
    }
  }
}])

//Change the map bounds based on the markers on the screen
app.factory('fitBounds', function(){
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
  }
});


 










