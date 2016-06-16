angular.module('starter')
  .controller('homeCtrl',['$scope', '$state', 'firebaseAuth', 'user', function($scope, $state, firebaseAuth, user){

    $scope.loginGoogle = function(){
      console.log('Google');
      firebaseAuth.googleLogin();
    }

    $scope.loginFacebook = function(){
      console.log('Facebook');
    }

    $scope.logout = function(){
      console.log('Logout');
    }

    $scope.openMap = function(){
      $state.go('map');
    }

  }])