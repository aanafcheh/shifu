// APP 1
// This app is used when the user is logged in
//
angular
  .module('shifuProfile', [
    'lbServices',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ui.router',
    'ui.bootstrap',
    'angularFileUpload',
    'ngImgCrop',
    'angular.filter',
    'ui.select',
    'ngCookies'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$resourceProvider', function($stateProvider,
    $urlRouterProvider, $resourceProvider) {
    $stateProvider

    // common states
      .state('app', {
      url: '/',
      params: {
        noResults: null
      },
      views: {
        'header': {
          templateUrl: 'views/header.html',
          controller: 'HeaderController',
        },
        'view': {
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
        'view@': {
          templateUrl: 'views/search.html',
          controller: 'SearchController'
        }
      }
    })

    // restaurant states
    .state('app.application', {
      url: 'application',
      views: {
        'view@': {
          templateUrl: 'views/restaurant/restaurant-application.html',
          controller: 'ApplicationController'
        }
      },
    })

    .state('app.restaurantwizard', {
      url: 'wizard/:address/:zipcode',
      views: {
        'view@': {
          templateUrl: 'views/restaurant/restaurant-wizard.html',
          controller: 'RestaurantWizardController'
        }
      }
    })

    .state('app.owner', {
      url: 'restaurants/:city/:name',
      views: {
        'view@': {
          templateUrl: 'views/restaurant/restaurant.html',
          controller: 'RestaurantController'
        },
        'content@app.owner': {
          templateUrl: 'views/restaurant/menu.html',
        }
      }
    })

    .state('app.owner.settings', {
      url: '/settings',
      views: {
        'content@app.owner': {
          templateUrl: 'views/restaurant/settings.html',
          controller: 'RestaurantSettingsController'
        }
      }
    })

    .state('app.owner.help', {
      url: '/help',
      views: {
        'content@app.owner': {
          templateUrl: 'views/restaurant/help.html',
          controller: 'RestaurantHelpController'
        }
      }
    })
    //restaurant mobile states
    .state('app.profile', {
      url: 'profile',
      views: {
        'view@': {
          templateUrl: 'views/mobile/profile.html',
          controller: 'HeaderController'
        }
      }
    })

    .state('app.notifications', {
      url: 'notifications',
      views: {
        'view@': {
          templateUrl: 'views/mobile/notifications.html',
          controller: 'HeaderController'
        }
      }
    })

    // customer states
    .state('app.restaurant', {
      url: ':city/:name',
      views: {
        'view@': {
          templateUrl: 'views/customer/restaurant.html',
          controller: 'RestaurantController'
        }
      }
    })
    .state('app.checkout', {
      url: 'checkout',
      views: {
        'view@': {
          templateUrl: 'views/customer/checkout.html',
          controller: 'CheckoutController'
        }
      }
    });

    $urlRouterProvider.otherwise('/');

    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
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

      .state('home', {
      url: '/',
      params: {
        verifyEmail: null,
        userEmail: null
      },
      templateUrl: 'views/home.html',
      controller: 'IndexController'
    })

    .state('signup', {
      url: '/signup',
      templateUrl: 'views/signup.html',
      controller: 'SignupController'
    });

    $urlRouterProvider.otherwise('/');
  }]);
