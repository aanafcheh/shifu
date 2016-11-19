// APP 1
// This app is used when the user is logged in
//
angular
  .module('shifuProfile', [
    'lbServices',
    'ui.router',
    'ui.bootstrap',
    'angularFileUpload',
    'ngImgCrop'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
    $urlRouterProvider) {
    $stateProvider

    // common states
      .state('app', {
      url: '/',
      views: {
        'header': {
          templateUrl: 'views/header.html',
          controller: 'HeaderController'
        },
        'content': {
          templateUrl: 'views/user.html',
          controller: 'UserController'
        },
        'footer': {
          templateUrl: 'views/footer.html',
        }
      }

    })

    .state('app.search', {
      url: 'search=:keyword',
      views: {
        'content@': {
          templateUrl: 'views/search.html',
          controller: 'SearchController'
        }
      }
    })

    // restaurant states
    .state('app.application', {
      url: 'application',
      views: {
        'content@': {
          templateUrl: 'views/restaurant/restaurant-application.html',
          controller: 'ApplicationController'
        }
      }
    })

    .state('app.restaurantwizard', {
      url: 'wizard/:address/:zipcode',
      views: {
        'content@': {
          templateUrl: 'views/restaurant/restaurant-wizard.html',
          controller: 'RestaurantWizardController'
        }
      }
    })

    .state('app.owner', {
      url: 'restaurants/:city/:name',
      views: {
        'content@': {
          templateUrl: 'views/restaurant/restaurant.html',
          controller: 'RestaurantController'
        }
      }
    })

    // customer states
    .state('app.restaurant', {
      url: ':city/:name',
      views: {
        'content@': {
          templateUrl: 'views/customer/restaurant.html',
          controller: 'RestaurantController'
        }
      }
    });

    $urlRouterProvider.otherwise('/');
  }]);

// APP 2
// This app is used when the user is not logged in, e.x. on the index page
//
angular
  .module('shifu', [
    'lbServices',
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider,
    $urlRouterProvider) {
    $stateProvider
      .state('app', {
        url: '',
        templateUrl: 'views/home.html',
        controller: 'IndexController'
      });

    $urlRouterProvider.otherwise('/');
  }]);
