angular.module('starter')
  .factory("firebaseService",['existingPlaces', 'listView', 'placeConstructor', 'fitBounds', 'errorMessage', 'location', 'allPlaces', function(existingPlaces, listView, placeConstructor, fitBounds, errorMessage, location, allPlaces){

    var config = {
      apiKey: "AIzaSyAQchOOXdXejiMOcTKoj_w6hDbg-01m3jQ",
      authDomain: "map-notes-d1949.firebaseapp.com",
      databaseURL: "https://map-notes-d1949.firebaseio.com",
      storageBucket: "map-notes-d1949.appspot.com",
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    //var userId = firebase.auth().currentUser.uid;
    var userId = 'piyDDcON4kZPoS1KxwwE4tk7mGM2';

    savePlaceToListView = function(item, key){
      listView.push(new placeConstructor.Place(item['name'], item['latitude'], item['longitude'], item['type'], item['notes'], item['address'], key));
      fitBounds.fitBoundsToVisibleMarkers(listView);
    }

    database.ref('/users/'+userId+'/places').on('value', function(response){
      if(existingPlaces.groups.length > 1 || existingPlaces.types.length > 1){
        while(existingPlaces.groups.length !== 1){
          existingPlaces.groups.pop();
        }
        while(existingPlaces.types.length !== 1){
          existingPlaces.types.pop();
        }
      }
      var items = response.val();
      if(items){
        Object.keys(items).forEach(function(key){
          if(existingPlaces.groups.indexOf(key) === -1){
            existingPlaces.groups.push(key);
          }
          var item = items[key];
          Object.keys(item).forEach(function(key){
            if(existingPlaces.types.indexOf(item[key]['type']) === -1){
              existingPlaces.types.push(item[key]['type']);
            }
          })
        })
      }
    });

    return {
      savePlace: function(group, type, placeObject){
        //database.ref('places/places/'+group).push(placeObject);
        var key = database.ref('/users/'+userId+'/places/'+group).push(placeObject).key;
        savePlaceToListView(placeObject, key);

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
        database.ref('/users/'+userId+'/places').once('value')
        .then(function (response) {
          var items = response.val();
          if(items){
            Object.keys(items).forEach(function(key){
              if(existingPlaces.groups.indexOf(key) === -1){
                existingPlaces.groups.push(key);
              }
            });
          }
        })
        //Add types to ExistingPlaces array
        database.ref('/users/'+userId+'/places').once('value') 
        .then(function (response) {
          var items = response.val();
          if(items){
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                if(existingPlaces.types.indexOf(item[key]['type']) === -1){
                  existingPlaces.types.push(item[key]['type']);
                }
              })
            });
          }
        })
      },
      searchForPlaces: function(group, type){
        if(group === "All" && type === "All"){
          database.ref('/users/'+userId+'/places').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                savePlaceToListView(item[key], key);
              })
            })
          })
        }else if(group === "All" && type !== "All"){
          database.ref('/users/'+userId+'/places').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                if(item[key]['type'] === type){
                  savePlaceToListView(item[key], key);
                }
              })
            })
          })
        }else if(group !== "All" && type === "All"){
          database.ref('/users/'+userId+'/places'+ group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              savePlaceToListView(items[key], key);
            })
          })
        }else{
          database.ref('/users/'+userId+'/places'+ group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              if(items[key]['type'] === type){
                savePlaceToListView(items[key], key);
              }
            })
            if(listView.length === 0){
              errorMessage.searchErrorAlert();
            }
          })
        }
      },
      placesByLocation: function(lat, lng, distance){
        database.ref('/users/'+userId+'/places').once('value')
        .then(function(response){
          var minMax = location.findLocationsBasedOnRadius(lat, lng, distance);
          var items = response.val();
          Object.keys(items).forEach(function(key){
            var item = items[key];
            Object.keys(item).forEach(function(key){
              if(item[key]["latitude"] > minMax.minLat && item[key]["latitude"] < minMax.maxLat && item[key]["longitude"] > minMax.minLng && item[key]["longitude"] < minMax.maxLng){
                //calculate distance from start point to saved location
                var resultDistance = location.calculateDistance(lat, item[key]["latitude"], lng, item[key]["longitude"]);
                if(resultDistance < distance){
                  savePlaceToListView(item[key], key);
                }
              }
            })
          })
        })
      },
      getPlaces: function(){
        var place = {};
        database.ref('/users/'+userId+'/places').on('value', function(response){
          while(allPlaces.length !== 0){
            allPlaces.pop();
          }
          var items = response.val();
          if(items){
            Object.keys(items).forEach(function(key){
              var nameKey = key;
              place = {name: nameKey, items:[]};
              var item = items[key];
              Object.keys(item).forEach(function(key){
                place.items.push({name: item[key]['name'], group: item[key]['group'], address: item[key]['address'], type: item[key]['type'], notes: item[key]['notes'], latitude: item[key]['latitude'], longitude: item[key]['longitude'], uid: key});
              })
              allPlaces.push(place);
            })
          }
        })
      },
      deletePlace: function(group, placeId){
        database.ref('/users/'+userId+'/places'+group+'/'+placeId).remove()
      },
      editPlace: function(group, type, notes, olditem){
        if(olditem.group !== group){
          var newPlace = {group: group, type: type, notes: notes, address: olditem.address, latitude: olditem.latitude, longitude: olditem.longitude, name: olditem.name}
          database.ref('/users/'+userId+'/places'+group).push(newPlace)
          .then(function(){
            database.ref('/users/'+userId+'/places'+olditem.group+'/'+olditem.uid).remove()
          })
        }else{
        var updates = {type: type, notes: notes};
        database.ref('/users/'+userId+'/places'+group+'/'+olditem.uid).update(updates)
        }
      }
    }
}])

  .factory('location', function(){
    // Converts from degrees to radians.
    Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };
    // Converts from radians to degrees.
    Math.degrees = function(radians) {
      return radians * 180 / Math.PI;
    };

    return {
      findLocationsBasedOnRadius: function(lat, lng, distance){
        var distance = distance;
        var lat = lat;
        var lng = lng;
        var radius = 6371;//radius at equater = 6378, at poles 6356
        var results = {};
        var latDegrees = Math.degrees(distance/radius);

        results.maxLat = (lat*1) + (latDegrees*1);//max
        results.minLat = lat - latDegrees;//min

        results.maxLng = (lng*1) + (Math.degrees(distance/radius/Math.cos(Math.radians(lat)))*1);//max
        results.minLng = lng - Math.degrees(distance/radius/Math.cos(Math.radians(lat)));//min

        return results;
      },
      calculateDistance: function (lat1, lat2, lng1, lng2){
        var lat1 = Math.radians(lat1);
        var lat2 = Math.radians(lat2);
        var lng1 = Math.radians(lng1);
        var lng2 = Math.radians(lng2);

        var distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng1 - lng2));

        return 6371 * distance;
      }
    }
  })