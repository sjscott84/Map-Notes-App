angular.module('starter')  
  .controller('editCtrl',['$scope', '$state', 'allPlaces', 'popup', function($scope, $state, allPlaces, popup){
    $scope.list = allPlaces;

    $scope.$watchCollection(
      function(){
        return allPlaces;
      },
      function(newVal, oldVal){
        if(newVal !== oldVal){
          $scope.list = allPlaces;
        }else{
          console.log('No Change');
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
      //console.log('Edit '+item.type);
      popup.editItem($scope, item);
      console.log(item);
    }

    $scope.delete= function(item){
      popup.deletePlace($scope, item);
    }
  }]);