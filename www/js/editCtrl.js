'use strict';
angular.module('starter')  
  .controller('editCtrl',['$scope', '$state', 'allPlaces', 'popup', 'existingPlaces', 'dropdownList', '$ionicModal', function($scope, $state, allPlaces, popup, existingPlaces, dropdownList, $ionicModal){

    $scope.list = allPlaces;
    $scope.matchingGroups = [];
    $scope.matchingTypes = [];

    $scope.$watchCollection(
      function(){
        return allPlaces;
      },
      function(newVal, oldVal){
        if(newVal !== oldVal){
          $scope.list = allPlaces;
          localStorage.setItem('places', JSON.stringify(allPlaces));
        }else{
        }
      },true);

    $scope.returnToMap = function(){
      $state.go('map');
    };

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
      popup.editItem($scope, item);
    };

    $scope.delete= function(item){
      popup.deletePlace($scope, item);
    };

    $scope.deleteGroup = function(item){
      popup.deleteGroup($scope, item);
    };

    //Updates the groups that display on screen that match the search term
    $scope.getGroups = function(data) {
      $scope.matchingGroups = dropdownList.getGroups(data);
    };

    //Updates the types that display on screen that match the search term
    $scope.getTypes = function(data) {
      $scope.matchingTypes = dropdownList.getTypes(data);
    };

    //Closes the "autocomplete" dropdown list once an option has been selected when creating a new entry
    $scope.closeList = function(){
      $scope.matchingGroups = [];
      $scope.matchingTypes = [];
    };
  }]);

  app.factory('editPage',['$state', function($state){
    return{
      openEditPage: function(scope, item){
        $state.go('editPage');
      }
    }
  }])