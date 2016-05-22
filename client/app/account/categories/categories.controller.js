'use strict';

angular.module('highlevelApp')
  .controller('CategoriesCtrl', function ($scope, User, Auth, $http, $stateParams) {
    $scope.errors = {};
    $scope.choices = [];

    //$scope.categoryId = '5574a6261ab2690a1a458197';
    
    $scope.categoryId = $stateParams.id;

    $scope.getCategory = function(categoryId) {
      $http.get('/api/categories/'+$scope.categoryId).success(function(c) {
        $scope.category = c;
      });
    }

    $scope.getCategory($scope.categoryId);
    
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
