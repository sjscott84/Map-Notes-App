'use strict';
angular.module('starter')
//TODO: Why is this not in the popup factory????
  .factory('errorMessage',['$ionicPopup', function($ionicPopup){
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
      },
      noData: function(){
        var alertPopup = $ionicPopup.alert({
         title: 'Error',
         template: "You don't have any recommendations saved, please start saving some places"
       });
      },
      savePlaceErrorAlert: function(){
          var alertPopup = $ionicPopup.alert({
           title: 'Error',
           template: 'Ensure you enter a group, type and note!'
         });
      }
    };
  }]);