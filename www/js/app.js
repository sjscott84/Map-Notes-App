// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

var map;

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

app.run( function($ionicPlatform, $http, $rootScope, user, existingPlaces, firebaseService) {
  $rootScope.user = user;
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
    firebaseService.pageSetUp();
    firebaseService.getPlaces();
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
    Place: function (name, lat, lng, type, note, address, key){
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

app.directive('info',['$cordovaAppAvailability', 'currentPlace', 'firebaseService', function($cordovaAppAvailability, currentPlace, firebaseService){
  return {
    scope: {
      place:  '=places'
    },
    template: '<div class="infowindow"><div class="iw-title">{{place.name}}</div><div class="iw-info"><p>Type: {{place.type}}</p><p>Note: {{place.note}}</p><a ng-click="openNewMap()"">View On Google Maps</a></div></div>',
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

app.factory('popup', ['$ionicPopup', 'listView', 'placeConstructor', 'existingPlaces', 'firebaseService', function($ionicPopup, listView, placeConstructor, existingPlaces, firebaseService){
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

            //listView.push(new placeConstructor.Place(placeObject.name, placeObject.latitude, placeObject.longitude, placeObject.type, placeObject.notes, placeObject.address, ''));
            if(existingPlaces.groups.indexOf(placeObject.group) === -1){
              existingPlaces.groups.push(placeObject.group);
            }
            if(existingPlaces.types.indexOf(placeObject.type) === -1){
              existingPlaces.types.push(placeObject.type);
            }
            firebaseService.savePlace(placeObject.group, placeObject.type, placeObject);
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
              firebaseService.searchForPlaces(scope.data.selectedGroup, scope.data.selectedType);
            }
          }
        ]
      })
    },
    deletePlace: function(scope, item){
      var myPopup = $ionicPopup.show({
        title: "Are you sure you want to delete "+item.name+"?",
        scope : scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(){
            } 
          },
          {
            text: '<b>Delete</b>',
            type: 'button-assertive',
            onTap: function() {
              console.log("delete");
              firebaseService.deletePlace(item.group, item.uid);
            }
          }
        ]
      })
    },
    editItem: function(scope, item){
      scope.data = {group: item.group, type: item.type, note: item.notes};
      scope.item = item;
      var myPopup = $ionicPopup.show({
        templateUrl: 'templates/editPopup.html',
        title: item.name,
        scope: scope,
        buttons: [
          {
          text: 'Cancel',
            onTap: function(){
            }
          },
          {
          text: '<b>Save</b>',
          type: 'button-positive',
            onTap: function(e) {
              firebaseService.editPlace(scope.data.group, scope.data.type, scope.data.note, scope.item);
            }
          }
        ]
      })
    }
  }
}]);

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

app.factory('fitBounds', function(){
  function zoomControl(){
    var zoom = map.getZoom();
    map.setZoom(zoom > 15 ? 15 : zoom);
  }
  return {
    fitBoundsToVisibleMarkers: function(listView){
      var bounds = new google.maps.LatLngBounds();

      for (var i=0; i<listView.length; i++) {
        if(listView[i].marker.getVisible()) {
          bounds.extend(listView[i].marker.getPosition() );
        }
      }
      map.fitBounds(bounds);
      zoomControl();
    }
  }
});


 










