'use strict';
angular.module('starter')
  .controller('homeCtrl',['$scope', '$state', 'firebaseAuth', 'appState', 'user', 'popup', function($scope, $state, firebaseAuth, appState, user, popup){

    $scope.activeUser = false;

    $scope.$watchCollection(
      function(){
        return user.data;
      },
      function(newVal, oldVal){
        if(newVal !== oldVal){
          if(newVal){
            $scope.activeUser = true;
            $scope.displayName = newVal.displayName;
          }else{
            $scope.activeUser = false;
          }
        }else if(newVal === oldVal){
          if(oldVal){
            $scope.activeUser = true;
            $scope.displayName = newVal.displayName;
          }else{
            $scope.activeUser = false;
          }
        }
      },true);

    /*$scope.loginGoogle = function(){
      firebaseAuth.googleLogin(function(error){
        popup.loginErrors(error);
      });
    }*/

    $scope.loginFacebook = function(){
      firebaseAuth.facebookLogin(function(error){
        popup.loginErrors(error);
      });
    };

    $scope.loginEmail = function(){
      popup.signinEmail($scope);
    };

    $scope.createAccount = function(){
      popup.createAccount($scope);
    };

    $scope.logout = function(){
      firebaseAuth.logout();
      Object.keys(user).forEach(function(key){delete user[key]});
    };

    $scope.openMap = function(){
      $state.go('map');
    };

  }]);