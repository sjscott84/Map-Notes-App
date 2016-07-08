angular.module('starter')
  .controller('MainCtrl', ['$scope', 'currentPlace', 'appState', function($scope, currentPlace, appState){
    $scope.$watchCollection(
      function(){
        return currentPlace;
      },
      function(newVal, oldVal){
        if(newVal !== oldVal){
          $scope.thisplace = currentPlace;
        }else{
          console.log('No Change');
        }
      },true);
  }])