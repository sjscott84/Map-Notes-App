angular.module('starter')
  .controller('homeCtrl',['$scope', '$state', 'firebaseAuth', 'appState', 'user', function($scope, $state, firebaseAuth, appState, user){

    $scope.loginGoogle = function(){
      console.log('Google');
      firebaseAuth.googleLogin();
      $state.go('map');
    }

    $scope.loginFacebook = function(){
      console.log('Facebook');
    }

    $scope.logout = function(){
      firebaseAuth.logout();
      Object.keys(user).forEach(function(key){delete user[key]});
    }

    $scope.openMap = function(){
      $state.go('map');
    }

  }])