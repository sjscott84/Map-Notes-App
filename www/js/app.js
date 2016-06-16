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

app.run( function($ionicPlatform, $http, existingPlaces, server, firebaseService) {
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
    firebaseService.getPlaces();
})

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })
  .state('edit', {
    url: '/edit',
    templateUrl: 'templates/edit.html',
    controller: 'editCtrl'
  });

  $urlRouterProvider.otherwise("/");
})

app.controller('editCtrl',['$scope', 'firebaseService', 'allPlaces', 'popup', function($scope, firebaseService, allPlaces, popup){
  $scope.list = allPlaces;

  $scope.$watchCollection(
    function(){
      return allPlaces;
    },
    function(newVal, oldVal){
      if(newVal !== oldVal){
        $scope.list = allPlaces;
      }else{
        console.log('No Change');
      }
    },true);

  $scope.returnToMap = function(){
    document.location.href = '#/';
  }

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };

  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.edit= function(item){
    console.log('Edit '+item.type);
  }

  $scope.delete= function(item){
    popup.deletePlace($scope, item);
  }
}]);

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


app.controller('MenuCtrl', ['$scope', '$ionicSideMenuDelegate', 'popup', 'server', 'listView', 'fitBounds', 'existingPlaces', function($scope, $ionicSideMenuDelegate, popup, server, listView, fitBounds, existingPlaces){
  $scope.tasks = [
    {title: 'Find places by location',
    func: 'searchByLocation'},
    {title: 'Search for places',
    func: 'searchByWhat'},
    {title: 'Remove current places',
    func: 'removePlaces'},
    {title: 'Edit Places',
    func: 'editPlaces'}
  ];

  $scope.searchByWhat = function(){
    $scope.removePlacesFromList();
    $ionicSideMenuDelegate.toggleLeft();
    //var promise = server.pageSetUp();
    //promise.then(
      //function(){
        $scope.group  = existingPlaces.groups;
        $scope.type = existingPlaces.types;
        popup.getPlaces($scope);
      //}
    //);
  };

  $scope.searchByLocation = function(){
    $scope.removePlacesFromList();
    server.resultsByLocation();
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.editPlaces = function(){
    $ionicSideMenuDelegate.toggleLeft();
    document.location.href = '#/edit';
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

app.factory('server', ['existingPlaces', 'listView', 'currentPosition', 'fitBounds', 'placeConstructor', 'errorMessage', 'firebaseService', function(existingPlaces, listView, currentPosition, fitBounds, placeConstructor, errorMessage, firebaseService){
  return {
    pageSetUp: function(){
      firebaseService.pageSetUp();
    },
    savePlace: function(placeObject){
      firebaseService.savePlace(placeObject.group, placeObject.type, placeObject);
    },
    resultsByLocation: function(){
      firebaseService.placesByLocation(currentPosition.lat, currentPosition.lng, currentPosition.radius);
    },
    searchForPlaces: function(group, type){
      firebaseService.searchForPlaces(group, type)
    }
  }
}]);

app.factory('popup', ['$ionicPopup', 'server', 'listView', 'placeConstructor', 'existingPlaces', function($ionicPopup, server, listView, placeConstructor, existingPlaces){
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


 










