'use strict';

angular.module('highlevelApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      })
      .state('categories', {
        url: '/categories/:id',
        templateUrl: 'app/account/categories/categories.html',
        controller: 'CategoriesCtrl'
        //,authenticate: true
      })
      .state('architectures', {
        url: '/architectures/:id',
        templateUrl: 'app/account/architectures/architectures.html',
        controller: 'ArchitecturesCtrl'
        //,authenticate: true
      })
      .state('outcomes', {
        url: '/outcomes/:id',
        templateUrl: 'app/account/outcomes/outcomes.html',
        controller: 'OutcomesCtrl'
        //,authenticate: true
      });
  });