angular.module('starter')
  .controller('homeCtrl',['$scope', '$state', 'firebaseAuth', 'appState', 'user', 'popup', function($scope, $state, firebaseAuth, appState, user, popup){

    $scope.loginGoogle = function(){
      console.log('Google');
      firebaseAuth.googleLogin();
      $state.go('map');
    }

    $scope.loginFacebook = function(){
      console.log('Facebook');
    }

    $scope.loginTwitter = function(){
      console.log('Twitter');
    }

    $scope.loginEmail = function(){
      console.log('Email');
    }

    $scope.createAccount = function(){
      console.log('CreateAccount');
      popup.createAccount($scope);
    }

    $scope.logout = function(){
      firebaseAuth.logout();
      Object.keys(user).forEach(function(key){delete user[key]});
    }

    $scope.openMap = function(){
      $state.go('map');
    }

  }])