angular.module('starter')
  .factory("firebaseService",['existingPlaces', 'listView', 'placeConstructor', 'fitBounds',  function(existingPlaces, listView, placeConstructor, fitBounds){

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
        database.ref('places/places/'+group).push(placeObject);
        database.ref('places/catagories/'+'existingGroups').push(group);
        database.ref('places/catagories/'+'existingTypes').push(type);
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
        database.ref('places/catagories/'+'existingGroups').once('value')
        .then(function (response) {
          var items = response.val();
          Object.keys(items).forEach(function(key){
            if(existingPlaces.groups.indexOf(items[key]) === -1){
              existingPlaces.groups.push(items[key]);
            }
          });
        })
        //Add types to ExistingPlaces array
        database.ref('places/catagories/'+'existingTypes').once('value')
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
        if(group === "All" && type === "All"){
          database.ref('places/places/').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                listView.push(new placeConstructor.Place(item[key]['name'], item[key]['latitude'], item[key]['longitude'], item[key]['type'], item[key]['notes'], item[key]['address']));
                fitBounds.fitBoundsToVisibleMarkers(listView);
              })
            })
          })
        }else if(group === "All" && type !== "All"){
          database.ref('places/places/').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                if(item[key]['type'] === type){
                  listView.push(new placeConstructor.Place(item[key]['name'], item[key]['latitude'], item[key]['longitude'], item[key]['type'], item[key]['notes'], item[key]['address']));
                  fitBounds.fitBoundsToVisibleMarkers(listView);
                }
              })
            })
          })
        }else if(group !== "All" && type === "All"){
          database.ref('places/places/'+ group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              listView.push(new placeConstructor.Place(items[key]['name'], items[key]['latitude'], items[key]['longitude'], items[key]['type'], items[key]['notes'], items[key]['address']));
              fitBounds.fitBoundsToVisibleMarkers(listView);
            })
          })
        }else{
          database.ref('places/places/'+ group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              if(items[key]['type'] === type){
                listView.push(new placeConstructor.Place(items[key]['name'], items[key]['latitude'], items[key]['longitude'], items[key]['type'], items[key]['notes'], items[key]['address']));
                fitBounds.fitBoundsToVisibleMarkers(listView);
              }
            })
          })
        }
      }
    }
}])