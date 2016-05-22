'use strict';

angular.module('highlevelApp')
  .controller('OutcomesCtrl', function ($scope, User, Auth, $http, $stateParams) {
    $scope.errors = {};

    $scope.choices = [];

    $scope.outcomeId = $stateParams.id;
    
    $scope.getOutcome = function() {
      $http.get('/api/outcomes/'+$scope.outcomeId).success(function(c) {
        $scope.outcome = c;
      });
    }

  $scope.getOutcome();      
    
   $scope.refreshChoices = function(categoryId) {
      $http.get('/api/choices/category/'+$scope.categoryId).success(function(cs) {
        $scope.choices = cs;      
      });
    }

    $scope.addChoice = function() {
      if($scope.newChoice === '') {
        return;
      };
      $http.post('/api/choices', { name: $scope.newChoice, categoryId: $scope.categoryId });
      $scope.newChoice = '';
      $scope.refreshChoices();
    };

    $scope.deleteChoice = function(c) {
      $http.delete('/api/choices/' + c._id);
      $scope.refreshChoices();
    };

    
    $scope.refreshChoices();


  });
