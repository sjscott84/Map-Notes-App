var app = angular.module('starter')  
  app.controller('editCtrl',['$scope', '$state', 'allPlaces', 'popup', 'editPage', function($scope, $state, allPlaces, popup, editPage){

    $scope.list = allPlaces;

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
    }

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
    }

    $scope.delete= function(item){
      popup.deletePlace($scope, item);
    }
  }]);

  app.factory('editPage',['$state', function($state){
    return{
      openEditPage: function(scope, item){
        $state.go('editPage');
      }
    }
  }])