'use strict';
angular.module('starter')
//Controls the content of the infowindow when a marker is clicked
  .directive('info',['$rootScope', '$cordovaAppAvailability', 'currentPlace', 'appState', '$injector', 'listView', 'placeConstructor', 'fitBounds', function($rootScope, $cordovaAppAvailability, currentPlace, appState, $injector, listView, placeConstructor, fitBounds){

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
      template: '<div class="infowindow"><div class="iw-title">{{place.name}}</div><div class="iw-info"><p>Type: {{place.type}}</p><p>Note: {{place.note}}</p><a ng-click="openNewMap()"">Navigation</a></div><ion-checkbox ng-model="place.visited" ng-change="markAsVisited()">Mark as done?</ion-checkbox></div>',
      //<button ng-hide="place.visited" ng-click="markAsVisited()" class="button button-block button-positive">Visited?</button>
      //<p ng-show="place.visited">You have visited this place!</p>
      link: function(scope, element, attrs) {
        scope.markAsVisited = function(){
          var copyOfPlace;
          //Changes the marker icon when visited value changed
          listView.forEach(function(listViewPlace){
            if(listViewPlace.uid === currentPlace.uid){
              copyOfPlace = listViewPlace;
              var index = listView.indexOf(listViewPlace);
              var x = listView.splice(index, 1);
              x[0].marker.setMap(null);
              copyOfPlace.visited = scope.place.visited;
              listView.push(new placeConstructor.Place(copyOfPlace['name'], copyOfPlace['lat'], copyOfPlace['lng'], copyOfPlace['type'], copyOfPlace['notes'], copyOfPlace['address'], copyOfPlace['group'], copyOfPlace['visited'], copyOfPlace['uid'], copyOfPlace.map));
            }
          })
          var service = $injector.get('firebaseData');
          //Updates firebase with changes
          service.addVisited(currentPlace.group, scope.place.visited, currentPlace.uid);
        },
        scope.openNewMap = function(){
          var lat = currentPlace.lat;
          var lng = currentPlace.lng;
          if(appState.cordova){
            $cordovaAppAvailability.check('comgooglemaps://')
            .then(function(){
            var sApp = startApp.set('comgooglemaps://?q='+lat+'+'+lng+'&zoom=13');
            sApp.start(function() {
            }, function(error) {
              alert(error);
            }); 
            })
            .catch(function(){
              $cordovaAppAvailability.check('http://maps.apple.com')
              .then(function(){
                var sApp = startApp.set('http://maps.apple.com/?q='+lat+'+'+lng+'&z=13');
                sApp.start(function() {
                }, function(error) {
                  alert(error);
                });
              })
              .catch(function(){
                window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng, "_blank");
              });
            });
          }else{
            window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng, "_blank");
          }
        };
      }
    };
  }]);