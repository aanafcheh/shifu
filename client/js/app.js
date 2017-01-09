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
    'ngImgCrop',
    'angular.filter',
    'ui.select',
    'ngCookies',
    'ngFileUpload'
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
      authenticate: true,
      views: {
        'header': {
          templateUrl: 'views/layouts/profile-header.html',
          controller: 'HeaderController'
        },
        'view': {
          templateUrl: 'views/user.html',
          controller: 'UserController'
        },
        'footer': {
          templateUrl: 'views/layouts/profile-footer.html'
        }
      }

    })

    .state('app.home', {
      url: 'home',
      params: {
        verifyEmail: null,
        userEmail: null
      },
      views: {
        'header@': {
          templateUrl: 'views/layouts/index-header.html',
          controller: 'IndexController'
        },
        'view@': {
          templateUrl: 'views/home.html',
          controller: 'IndexController'
        },
        'footer@': {
          templateUrl: 'views/layouts/index-footer.html'
        }
      }
    })

    .state('app.signup', {
      url: 'signup',
      views: {
        'header@': {
          templateUrl: 'views/layouts/index-header.html',
        },
        'view@': {
          templateUrl: 'views/signup.html',
          controller: 'SignupController'
        },
        'footer@': {
          templateUrl: 'views/layouts/index-footer.html'
        }
      }
    })

    .state('app.login', {
      url: 'login',
      views: {
        'header@': {
          templateUrl: 'views/layouts/index-header.html',
        },
        'view@': {
          templateUrl: 'views/login-error.html',
        },
        'footer@': {
          templateUrl: 'views/layouts/index-footer.html'
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

    .state('app.settings', {
      url: 'settings',
      views: {
        'view@': {
          templateUrl: 'views/settings.html',
          controller: 'UserSettingsController'
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
