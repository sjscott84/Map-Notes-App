angular.module('starter')
  .factory("firebaseService",['existingPlaces', function(existingPlaces){

    var config = {
      apiKey: "AIzaSyAQchOOXdXejiMOcTKoj_w6hDbg-01m3jQ",
      authDomain: "map-notes-d1949.firebaseapp.com",
      databaseURL: "https://map-notes-d1949.firebaseio.com",
      storageBucket: "map-notes-d1949.appspot.com",
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    return {
      savePlace: function(group, type, placeObject){
        console.log(placeObject);
        database.ref('places/'+group).push(placeObject);
        database.ref('places/'+'ExistingGroups').push(group);
        database.ref('places/'+'ExistingTypes').push(type);
      },
      pageSetUp: function(){
        //Clear out existingPlaces before repopulating
        if(existingPlaces.groups.length > 1 || existingPlaces.types.length > 1){
          while(existingPlaces.groups.length !== 1){
            existingPlaces.groups.pop();
          }
          while(existingPlaces.types.length !== 1){
            existingPlaces.types.pop();
          }
        }
        //Add groups to ExistingPlaces array
        database.ref('places/'+'ExistingGroups').once('value')
        .then(function (response) {
          var items = response.val();
          Object.keys(items).forEach(function(key){
            if(existingPlaces.groups.indexOf(items[key]) === -1){
              existingPlaces.groups.push(items[key]);
            }
          });
        })
        //Add types to ExistingPlaces array
        database.ref('places/'+'ExistingTypes').once('value')
        .then(function (response) {
          var items = response.val();
          Object.keys(items).forEach(function(key){
            if(existingPlaces.types.indexOf(items[key]) === -1){
              existingPlaces.types.push(items[key]);
            }
          });
        })
      },
      searchForPlaces: function(group, type){
        database.ref('places/'+group).once('value')
        .then(function(response){
          var items = response.val();
          Object.keys(items).forEach(function(key){
            var item = items[key]
            Object.keys(item).forEach(function(what){
              console.log(item[what]);
            })
          })
          //console.log(response.val());
        })
      }
    }
}])