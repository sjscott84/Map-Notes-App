angular.module('starter')
//Controls the content of the infowindow when a marker is clicked
  .directive('info',['$cordovaAppAvailability', 'currentPlace', 'appState', function($cordovaAppAvailability, currentPlace, appState){

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
          if(appState.cordova){
            $cordovaAppAvailability.check('comgooglemaps://')
            .then(function(){
            var sApp = startApp.set('comgooglemaps://?q='+lat+'+'+lng+'&zoom=13');
            //console.log("map avaliable")
            sApp.start(function() {
              console.log("OK");
            }, function(error) {
              alert(error);
            });
            })
            .catch(function(){
              $cordovaAppAvailability.check('http://maps.apple.com')
              .then(function(){
                //console.log('Apple map avaliable')
                var sApp = startApp.set('http://maps.apple.com/?q='+lat+'+'+lng+'&z=13');
                sApp.start(function() {
                  console.log("OK");
                }, function(error) {
                  alert(error);
                });
              })
              .catch(function(){
                //console.log("map not avaliable")
                window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng, "_blank");
              })
            });
          }else{
            window.open("https://maps.google.com/maps?ll="+lat+","+lng+"&z=13&t=m&hl=en-US&q="+lat+"+"+lng, "_blank");
          }
        }
      }
    }
  }])