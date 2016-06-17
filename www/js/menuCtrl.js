angular.module('starter')
  .controller('MenuCtrl', ['$scope', '$ionicSideMenuDelegate', '$state', 'popup', 'listView', 'fitBounds', 'existingPlaces', 'currentPosition', 'firebaseData', function($scope, $ionicSideMenuDelegate, $state, popup, listView, fitBounds, existingPlaces, currentPosition, firebaseData){
    $scope.tasks = [
      {title: 'Find places by location',
      func: 'searchByLocation'},
      {title: 'Search for places',
      func: 'searchByWhat'},
      {title: 'Remove current places',
      func: 'removePlaces'},
      {title: 'Edit Places',
      func: 'editPlaces'},
      {title: 'Logout',
      func: 'logoutScreen'}
    ];

    $scope.searchByWhat = function(){
      $scope.removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();
      //var promise = server.pageSetUp();
      //promise.then(
        //function(){
          $scope.group  = existingPlaces.groups;
          $scope.type = existingPlaces.types;
          popup.getPlaces($scope);
        //}
      //);
    };

    $scope.searchByLocation = function(){
      $scope.removePlacesFromList();
      firebaseData.placesByLocation(currentPosition.lat, currentPosition.lng, currentPosition.radius);
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.editPlaces = function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('edit');
      //document.location.href = '#/edit';
    };

    $scope.removePlaces = function(){
      $scope.removePlacesFromList();
      $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.removePlacesFromList = function(){
      while(listView.length !== 0){
        var x = listView.pop();
        x.marker.setMap(null);
      }
    };

    $scope.logoutScreen = function(){
      $ionicSideMenuDelegate.toggleLeft();
      $state.go('home');
    }
  }]);