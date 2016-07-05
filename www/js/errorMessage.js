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
      }
    }
  }])