'use strict';
angular.module('starter')
  .factory("firebaseData",['existingPlaces', 'existingPlacesGrouped', 'listView', 'placeConstructor', 'fitBounds', 'errorMessage', 'location', 'allPlaces', 'firebaseService', 'user', 'appState', function(existingPlaces, existingPlacesGrouped, listView, placeConstructor, fitBounds, errorMessage, location, allPlaces, firebaseService, user, appState){
  
    var firebase = firebaseService.fb;
    var database = firebase.database();

    function checkConnection(){
      if(!appState.offline){
        return firebase.database();
      }else{
        return 'NA';
      }
    }

    function savePlaceToListView (item, key, map){
      listView.push(new placeConstructor.Place(item['name'], item['latitude'], item['longitude'], item['type'], item['notes'], item['address'], item['group'], item['visited'], key, map));
      fitBounds.fitBoundsToVisibleMarkers(listView, map);
    }

    function clearExistingPlaces(){
      if(existingPlaces.groups.length > 1 || existingPlaces.types.length > 1){
        existingPlaces.groups[0] = "All";
        existingPlaces.types[0] = "All";
        while(existingPlaces.groups.length !== 1){
          existingPlaces.groups.pop();
        }
        while(existingPlaces.types.length !== 1){
          existingPlaces.types.pop();
        }
      }
    }

    function updateAllPlaces(items, callback){
      var place = {};
      while(allPlaces.length !== 0){
        allPlaces.pop();
      }
      if(items){
        Object.keys(items).forEach(function(key){
          var nameKey = key;
          place = {name: nameKey, items:[]};
          var item = items[nameKey];
          Object.keys(item).forEach(function(key){
            place.items.push({name: item[key]['name'], group: item[key]['group'], address: item[key]['address'], type: item[key]['type'], notes: item[key]['notes'], latitude: item[key]['latitude'], longitude: item[key]['longitude'], visited: item[key]['visited'], uid: key});
          });

          allPlaces.push(place);
        });
      }
      callback();
    }

    function updateAfterChange(){
      database.ref('/users/'+user.data.uid+'/places').on('value', function(response){
        clearExistingPlaces();
        var items = response.val();
        updateAllPlaces(items, function(){
          localStorage.setItem('places', JSON.stringify(allPlaces));
        });
        updateHelperMethod(items);
      });
    }

    function updateHelperMethod(data){
      if(data){
        Object.keys(data).forEach(function(key){
          if(existingPlaces.groups.indexOf(key) === -1){
            existingPlaces.groups.push(key);
            var type = data[key];
            existingPlacesGrouped[key] = [];
            existingPlacesGrouped[key].push("All");
            Object.keys(type).forEach(function(typeKey){
              if(existingPlacesGrouped[key].indexOf(type[typeKey]['type']) === -1){
                existingPlacesGrouped[key].push(type[typeKey]['type']);
              }
              if(existingPlaces.types.indexOf(type[typeKey]['type']) === -1){
                existingPlaces.types.push(type[typeKey]['type']);
              }
            });
          }
        });
      }
    }

    return {
      savePlace: function(group, type, placeObject, map){
        if(!group || !type || !placeObject.notes){
          errorMessage.savePlaceErrorAlert();
        }else{
          var key = database.ref('/users/'+user.data.uid+'/places/'+group).push(placeObject).key;
          savePlaceToListView(placeObject, key, map);
          updateAfterChange();
        }
      },
      pageSetUp: function(){
        //Clear out existingPlaces before repopulating
        clearExistingPlaces();
        database.ref('/users/'+user.data.uid+'/places').once('value')
          .then(function (response) {
            var items = response.val();
            updateHelperMethod(items);
          })
          .catch(function(response){
            console.log('No Internet');
          });
      },
      searchForPlaces: function(group, type, map){
        if(group === "All" && type === "All"){
          database.ref('/users/'+user.data.uid+'/places').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                savePlaceToListView(item[key], key, map);
              });
            });
          });
        }else if(group === "All" && type !== "All"){
          database.ref('/users/'+user.data.uid+'/places').once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              var item = items[key];
              Object.keys(item).forEach(function(key){
                if(item[key]['type'] === type){
                  savePlaceToListView(item[key], key, map);
                }
              });
            });
          });
        }else if(group !== "All" && type === "All"){
          database.ref('/users/'+user.data.uid+'/places/'+group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              savePlaceToListView(items[key], key, map);
            });
          });
        }else{
          database.ref('/users/'+user.data.uid+'/places/'+group).once('value')
          .then(function(response){
            var items = response.val();
            Object.keys(items).forEach(function(key){
              if(items[key]['type'] === type){
                savePlaceToListView(items[key], key, map);
              }
            });
            if(listView.length === 0){
              errorMessage.searchErrorAlert();
            }
          });
        }
      },
      placesByLocation: function(lat, lng, distance, map, callback){
        database.ref('/users/'+user.data.uid+'/places').once('value')
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
                  savePlaceToListView(item[key], key, map);
                }
              }
            });
          });
          if(listView.length === 0){
            errorMessage.searchErrorAlert();
          }
        });
      },
      //Used by firebaseAuth at page setup
      getPlaces: function(){
        database.ref('/users/'+user.data.uid+'/places').on('value', function(response){
          var items = response.val();
          updateAllPlaces(items, function(){
            localStorage.setItem('places', JSON.stringify(allPlaces));
          });
        });
      },
      deletePlace: function(group, placeId){
        database.ref('/users/'+user.data.uid+'/places/'+group+'/'+placeId).remove()
        .then(function(){
          updateAfterChange();
        });
      },
      deleteGroup: function(group){
        database.ref('/users/'+user.data.uid+'/places/'+group).remove()
        .then(function(){
          updateAfterChange();
        });
      },
      addVisited: function(group, visited, uid){
        var updates = {visited: visited};
        database.ref('/users/'+user.data.uid+'/places/'+group+'/'+uid).update(updates)
        .then(function(){
          updateAfterChange();
        })
      },
      editPlace: function(group, type, notes, olditem){
        if(olditem.group !== group){
          var newPlace = {group: group, type: type, notes: notes, address: olditem.address, latitude: olditem.latitude, longitude: olditem.longitude, name: olditem.name}
          database.ref('/users/'+user.data.uid+'/places/'+group).push(newPlace)
          .then(function(){
            database.ref('/users/'+user.data.uid+'/places/'+olditem.group+'/'+olditem.uid).remove();
            updateAfterChange();
          })
        }else{
          var updates = {type: type, notes: notes};
          database.ref('/users/'+user.data.uid+'/places/'+group+'/'+olditem.uid).update(updates)
          .then(function(){
            updateAfterChange();
          })
        }
      }
    }
  }])

  //Returns places based on radius around current location
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