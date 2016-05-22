'use strict';

angular.module('highlevelApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
    $scope.categories = [];
    $scope.architectures = [];
    $scope.outcomes = [];

    // $scope.refreshCategories = function() {
    //   $http.get('/api/category').success(function(cats) {
    //     $scope.categories = cats;      
    //   });
    // }

    // $scope.addCategory = function() {
    //   if($scope.newCategory === '') {
    //     return;
    //   }
    //   $http.post('/api/category', { name: $scope.newCategory });
    //   $scope.newCategory = '';
    //   $scope.refreshCategories();
    // };

    // $scope.deleteCategory = function(cat) {
    //   $http.delete('/api/category/' + cat._id);
    //   $scope.refreshCategories();
    // };



    $scope.refreshArchitectures = function() {
      $http.get('/api/architecture').success(function(cats) {
        $scope.architectures = cats;        
      });
    }

    $scope.addArchitecture = function() {
      if($scope.newArchitecture === '') {
        return;
      }
      $http.post('/api/architecture', { name: $scope.newArchitecture });
      $scope.newArchitecture = '';
      $scope.refreshArchitectures();
    };

    $scope.deleteArchitecture = function(cat) {
      $http.delete('/api/architecture/' + cat._id).success(function(){
        $scope.refreshArchitectures();  
      })
      
    };


  //   $scope.refreshOutcomes = function() {
  //     $http.get('/api/outcome').success(function(cats) {
  //       $scope.outcomes = cats;      
  //     });
  //   }

  //   $scope.addOutcome = function() {
  //     if($scope.newOutcome === '') {
  //       return;
  //     }
  //     $http.post('/api/outcome', { name: $scope.newOutcome });
  //     $scope.newOutcome = '';
  //     $scope.refreshOutcomes();
  //   };

  //   $scope.deleteOutcome = function(cat) {
  //     $http.delete('/api/outcome/' + cat._id);
  //     $scope.refreshOutcomes();
  //   };

  //   $scope.refreshCategories();
  //   $scope.refreshOutcomes();
    $scope.refreshArchitectures();
  
  });
