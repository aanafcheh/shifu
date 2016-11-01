//
// APP 1 Controllers - shifuProfile
//
//
angular.module('shifuProfile')

.controller('ProfileController', ['$scope', '$rootScope', '$state', '$filter', 'User', 'Restaurant', function($scope, $rootScope, $state, $filter, User, Restaurant) {

  // query all the needed information
  $scope.profile = User.identities({
    id: 'me'
  });

  $scope.restaurants = User.restaurants({
    id: 'me'
  });

  // Check if the user has a restaurant yet or not, and display content depending on that
  $scope.user = User.hasRestaurant();

}])

.controller('ApplicationController', ['$scope', '$state', '$stateParams', 'User', 'Restaurant', 'FileUploader', function($scope, $state, $stateParams, User, Restaurant, FileUploader) {

  $scope.application = {};

  //
  //  Uploader
  //

  // uploader1
  var uploader1 = $scope.uploader1 = new FileUploader({
    scope: $scope,
    url: '/api/containers/me/upload',
    formData: [{
      key: 'value'
    }]
  });

  // uploader1 size filter
  uploader1.filters.push({
    name: 'sizeLimit',
    fn: function(item) {
      return item.size <= 4194304;
    }
  });
  // uploader1 image filter
  uploader1.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/ , options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });

  // uploader2
  var uploader2 = $scope.uploader2 = new FileUploader({
    scope: $scope,
    url: '/api/containers/me/upload',
    formData: [{
      key: 'value'
    }]
  });

  // uploader2 size filter
  uploader2.filters.push({
    name: 'sizeLimit',
    fn: function(item) {
      return item.size <= 4194304;
    }
  });
  // uploader2 image filter
  uploader2.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/ , options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });

  //
  // post the form
  //


  //form submit function
  // in this function we query restaurants with the same address as the application form, on success an error will be shown that a restaurant with the same address exists otherwise the applicaiton will be submitted
  $scope.newRestaurant = function() {

    $scope.restaurant = Restaurant.findOne({
      filter: {
        where: {
          address: $scope.application.address,
          zipcode: $scope.application.zipcode
        }
      }
    }).$promise.then(
      function(response) {
        $scope.restaurant = response;
        $scope.addressExists = true;
        $scope.restaurantApplication.$setPristine();
      },
      function(error) {
        // create the restaurant
        User.restaurants.create({
          id: 'me'
        }, $scope.application);

        // update the user to be a restaurant
        User.prototype$updateAttributes({
          id: 'me'
        }, {
          restaurant: true
        });

        // upload the documents and go to the restaurant wizard
        $scope.uploader1.uploadAll();
        $scope.uploader2.uploadAll();
        $scope.restaurantApplication.$setPristine();
        $state.go('restaurantwizard', {
          'address': $scope.application.address,
          'zipcode': $scope.application.zipcode
        });
      }
    );
  };

  // close function for the restaurant uniqueness alert
  $scope.addressExists = false;
  $scope.closeAlert = function() {
    $scope.addressExists = false;
  };

}])

.controller('RestaurantWizardController', ['$scope', '$state', '$stateParams', '$filter', '$uibModal', 'Menu', 'User', 'Restaurant', function($scope, $state, $stateParams, $filter, $uibModal, Menu, User, Restaurant) {

  $scope.application = {};
  $scope.menu = {};

  //get the latest restaurantId of the user
  $scope.restaurantId = User.restaurants({
    id: 'me',
    filter: {
      "fields": {
        "id": true
      },
      "order": "id DESC",
      "limit": 1,
    }
  }).$promise.then(function(response) {
    $scope.restaurantId = response[0].id;
  });

  // time picker
  var time = new Date();
  time.setHours(9);
  time.setMinutes(0);
  $scope.application.workFrom = time;
  $scope.application.workTo = time;

  $scope.hstep = 1;
  $scope.mstep = 15;

  // change the tab view
  $scope.tab = 1;
  $scope.select = function(setTab) {
    $scope.tab = setTab;
  };
  $scope.isSelected = function(checkTab) {
    return ($scope.tab === checkTab);
  };

  //
  // IMAGE UPLOAD MODEL
  //
  $scope.open = function(size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'addImage.html',
      controller: 'ModalInstanceCtrl',
      size: size
    });

    modalInstance.result.then(function(image) {
      $scope.image = image;
    });
  };

  // submit info
  $scope.newRestaurant = function() {
    $scope.application.workFrom = $filter('date')($scope.application.workFrom, 'HH:mm:Z');
    $scope.application.workTo = $filter('date')($scope.application.workTo, 'HH:mm:Z');
    Restaurant.prototype$updateAttributes({
      id: $scope.restaurantId
    }, $scope.application);

    Restaurant.menus.create({
      id: $scope.restaurantId
    }, $scope.menu);
    $scope.restaurantProfile.$setPristine();
    $state.go('app');
  };

}])


.controller('ModalInstanceCtrl', ['$scope', '$state', 'FileUploader', '$uibModalInstance', 'User', function($scope, $state, FileUploader, $uibModalInstance, User) {

  // cropped image will be saved here
  $scope.image = "";

  $scope.ok = function() {
    angular.forEach(uploader.queue, function(value, key) {
      $scope.image = value.croppedImage;
    });
    $scope.uploader.uploadAll();
    $uibModalInstance.close($scope.image);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  /*
  Uploader
   */
  var uploader = $scope.uploader = new FileUploader({
    scope: $scope,
    url: '/api/containers/me/upload',
    formData: [{
      key: 'value'
    }]
  });

  // uploader size filter
  uploader.filters.push({
    name: 'sizeLimit',
    fn: function(item) {
      return item.size <= 4194304;
    }
  });
  // uploader image filter
  uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/ , options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });

  // show preview with cropping
  uploader.onAfterAddingFile = function(item) {
    item.croppedImage = '';
    var reader = new FileReader();
    reader.onload = function(event) {
      $scope.$apply(function() {
        item.image = event.target.result;
      });
    };
    reader.readAsDataURL(item._file);
  };

  // Upload Blob(cropped image) instead of file.
  // https: //developer.mozilla.org/en-US/docs/Web/API/FormData
  //   https: //github.com/nervgh/angular-file-upload/issues/208
  uploader.onBeforeUploadItem = function(item) {
    var blob = dataURItoBlob(item.croppedImage);
    item._file = blob;
  };

  // Converts data uri to Blob. Necessary for uploading.
  // http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
  var dataURItoBlob = function(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: mimeString
    });
  };

}])

.controller('RatingController', ['$scope', '$state', 'User', 'Restaurant', 'Feedback', function($scope, $state, User, Restaurant, Feedback) {
  $scope.max = 5;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

  // query restaurant id
  $scope.restaurantId = User.restaurants({
    id: 'me',
    filter: {
      fields: {
        id: true
      }
    }
  }).$promise.then(function(response) {
    $scope.restaurantId = response[0].id;
  });

  //restaurant rating
  $scope.newfeedback = function() {

    User.feedbacks({
      id: 'me',
      filter: {
        where: {
          restaurantId: $scope.restaurantId
        }
      }
    }).$promise.then(
      function(response) {
        if (response[0]) {
          response[0].rate = $scope.rate;
          response[0].$save();
        } else {
          User.feedbacks.create({
            id: 'me'
          }, {
            rate: $scope.rate,
            restaurantId: $scope.restaurantId
          });
        }

      },
      function(error) {
        User.feedbacks.create({
          id: 'me'
        }, {
          rate: $scope.rate,
          restaurantId: $scope.restaurantId
        });
      }
    );
  };

}])

.controller('RestaurantController', ['$scope', '$state', '$stateParams', 'User', 'Restaurant', function($scope, $state, $stateParams, User, Restaurant) {

  // query all the needed information
  $scope.profile = User.identities({
    id: 'me'
  });

  $scope.restaurant = User.restaurants({
    id: 'me',
    filter: {
      where: {
        city: $stateParams.city,
        restaurantName: $stateParams.name
      }
    }
  }).$promise.then(function(response) {
    $scope.restaurant = response;
    $scope.state = Restaurant.openOrClosed(response[0].id);
    console.log($scope.state);

  });


}])

//
// directives
//

// file input validation directive as it is not supported nativey by angularjs
.directive('validFile', function() {
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ngModel) {
      //change event is fired when file is selected
      el.bind('change', function() {
        scope.$apply(function() {
          ngModel.$setViewValue(el.val());
          ngModel.$render();
        });
      });
    }
  };
})

// parse ng-model data to lowercase
.directive('changeCase', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(str) {
        return str.toLowerCase();
      });
    }
  };
})

// filters
.filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
});

//
// APP 2 Controllers - shifu
//
angular.module('shifu')

.controller('IndexController', ['$scope', '$state', 'User', function($scope, $state, User) {



}]);
