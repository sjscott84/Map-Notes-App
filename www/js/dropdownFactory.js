'use strict';
angular.module('starter')
  .factory('dropdownList', ['existingPlaces', function(existingPlaces){
    var matchingGroups = [];
    var matchingTypes = []
    return {
      getGroups: function(data) {
        if(data.length !== 0){
          var entry = data.length;
        }
        matchingGroups = [];
        for(var i = 1; i<existingPlaces.groups.length; i++){
            var what = existingPlaces.groups[i].slice(0, entry);
            if(data.match(new RegExp([what], 'i'))){
              matchingGroups.push(existingPlaces.groups[i]);
          }
        }
        return matchingGroups;
      },
      getTypes: function(data) {
        if(data.length !== 0){
          var entry = data.length;
        }
        matchingTypes = [];
        for(var i = 1; i<existingPlaces.types.length-1; i++){
          var what = existingPlaces.types[i].slice(0, entry);
          if(data.match(new RegExp([what], 'i'))){
            matchingTypes.push(existingPlaces.types[i]);
          }
        }
        return matchingTypes
      }
    };
  }]);
