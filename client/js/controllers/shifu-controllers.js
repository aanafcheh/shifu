//
// APP 1 Controllers - shifuProfile
//
//
angular.module('shifuProfile')

.controller('ProfileController', ['$scope', '$state', 'User', function($scope, $state, User) {

  $scope.profile = User.identities({
    id: 'me'
  });

  $scope.userHasRestaurant = false;
  $scope.noRestaurant = false;
  $scope.restaurant = User.restaurants.count({
    id: 'me'
  }).$promise.then(
    function(response) {
      $scope.restaurant = response;
      if ($scope.restaurant.count === 0) {
        $scope.userHasRestaurant = false;
        $scope.noRestaurant = true;
      } else {
        $scope.userHasRestaurant = true;
        $scope.noRestaurant = false;
      }
    },
    function(error) {
      console.log("no restaurants");
    }
  );



}])

.controller('ApplicationController', ['$scope', '$state', 'User', 'Restaurant', 'FileUploader', function($scope, $state, User, Restaurant, FileUploader) {

  // create the object that will store the ng-models values
  $scope.application = {};

  // query the database for the required models
  $scope.profile = User.identities({
    id: 'me'
  });
  $scope.restaurant = User.restaurants({
    id: 'me'
  });


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

    $scope.allRestaurants = Restaurant.findOne({
      filter: {
        where: {
          address: $scope.application.address,
          zipcode: $scope.application.zipcode
        }
      }
    }).$promise.then(
      function(response) {
        $scope.allRestaurants = response;
        $scope.addressExists = true;
        $scope.restaurantApplication.$setPristine();
      },
      function(error) {
        // the restaurant was queried first at the beginning of the controller, so we can create an instance now.
        User.restaurants.create({
          id: 'me'
        }, $scope.application);
        $scope.uploader1.uploadAll();
        $scope.uploader2.uploadAll();
        $scope.restaurantApplication.$setPristine();
        $state.go('restaurant');
      }
    );
  };

  // close function for the restaurant uniqueness alert
  $scope.addressExists = false;
  $scope.closeAlert = function() {
    $scope.addressExists = false;
  };

}])

.controller('RestaurantController', ['$scope', '$state', '$uibModal', 'User', 'Restaurant', function($scope, $state, $uibModal, User, Restaurant) {

  $scope.application = {};
  $scope.menu = {};

  $scope.restaurant = User.find({include: ['restaurants']});
  console.log($scope.restaurant);

  // time picker
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

    modalInstance.result.then(function (image) {
      $scope.image = image;
    });
  };

// submit info
$scope.newRestaurant = function() {
  User.restaurants.save({
    id: 'me'
  }, $scope.application);
console.log($scope.application);
  // $state.go('restaurant');
};

$scope.newMenuItem = function() {
  User.restaurants.prototype$updateAttributes({
    id: 'me'
  }, $scope.application);
console.log($scope.application);
  // $state.go('restaurant');
};


}])

.controller('ModalInstanceCtrl', ['$scope', '$state', 'FileUploader', '$uibModalInstance','User', function($scope, $state, FileUploader, $uibModalInstance, User) {

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
});

//
// APP 2 Controllers - shifu
//
angular.module('shifu')

.controller('IndexController', ['$scope', '$state', 'User', function($scope, $state, User) {



}]);
