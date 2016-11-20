//
// APP 1 Controllers - shifuProfile
//
//
angular.module('shifuProfile')

.controller('HeaderController', ['$scope', '$state', '$stateParams', 'User', 'Restaurant', function($scope, $state, $stateParams, User, Restaurant) {

  // query all the needed information
  $scope.profile = User.identities({
    id: 'me'
  });

  $scope.restaurants = User.restaurants({
    id: 'me'
  }).$promise.then(function(response) {
    $scope.restaurants = response;
  });

  // query all the restaurants for suggestions
  $scope.allRestaurants = Restaurant.find();

  // search function
  $scope.search = function() {
    $state.go('app.search', {
      'keyword': $scope.result
    });
  };

}])

.controller('UserController', ['$scope', '$filter', '$state', '$stateParams', '$http', 'User', 'Restaurant', '$uibModal', function($scope, $filter, $state, $stateParams, $http, User, Restaurant, $uibModal) {

  // get the name of today to show the working hours accordingly
  $scope.today = $filter('date')(new Date(), 'EEEE');

  $scope.restaurants = User.restaurants({
    id: 'me'
  }).$promise.then(function(response) {
    $scope.restaurants = response;

    // check the status of a list of restaurants in a user profile or in search results
    angular.forEach(response, function(value, key) {
      $http.get('api/restaurants/' + value.id + '/openOrClosed').success(function(data) {
        angular.element(document).find("#" + value.id).append(data.openOrClosed);
      });
    });
  });

  $scope.getWorkingHours=function(id,workFrom,workTo){
    var allOpeningHours="";
    if(angular.element(document).find("#"+id+"openingHours").text().length>0){
      angular.element(document).find("#"+id+"openingHours")

    }
    else{


    angular.forEach(workFrom,function(key,value){
      if(key!=null){
      allOpeningHours=allOpeningHours+"<b>"+value+ " </b>"+": "+"<i>"+$filter('date')(key, "HH:mm")+"-"+$filter('date')(workTo[value], "HH:mm")+"</i><br>";
      }
    })
   angular.element(document).find("#"+id+"openingHours").append("<p class='openingHpurs' >"+allOpeningHours+"</p>");

  }
  }


  // Check if the user has a restaurant yet or not, and display content depending on that
  $http.get('api/users/me/restaurants/count').success(function(data) {
    $scope.restaurantCount = data.count;

  });

  // add menu item model
  $scope.open = function(size) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: '../../views/restaurant/addMenu.html',
      controller: 'ModalInstanceCtrl',
      size: size
    });

    modalInstance.result.then(function(menu) {
      $scope.menu = menu;
    });
  };


}])

.controller('ApplicationController', ['$scope', '$state', '$stateParams', '$window', 'User', 'Restaurant', 'FileUploader', function($scope, $state, $stateParams, $window, User, Restaurant, FileUploader) {

  $scope.application = {};

  // address suggestion by google
  //callback function from google api(for google address listing)
  $window.initAutocomplete = function() {
    var placeSearch, autocomplete, streetAddress;

    //fields
    componentForm = {
      route: 'short_name',
      postal_code: 'short_name',
      locality: 'long_name'
    };

    autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('route')), {
        types: ['geocode']
      });

    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();
      $scope.application.lat = place.geometry.location.lat();
      $scope.application.lng = place.geometry.location.lng();



      for (var component in componentForm) {
        document.getElementById(component).value = '';
      }


      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];

        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          document.getElementById(addressType).value = val;
        }
      }

    }
    autocomplete.addListener('place_changed', fillInAddress);
  };

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

        // upload the documents and go to the restaurant wizard
        $scope.uploader1.uploadAll();
        $scope.uploader2.uploadAll();
        $scope.restaurantApplication.$setPristine();
        $state.go('app.restaurantwizard', {
          'address': $scope.application.address,
          'zipcode': $scope.application.zipcode,
          'lng': $scope.application.lng,
          'lat': $scope.application.lat
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

.controller('RestaurantWizardController', ['$scope', '$state', '$stateParams', '$uibModal', 'Menu', 'User', 'Restaurant', function($scope, $state, $stateParams, $uibModal, Menu, User, Restaurant) {

  $scope.application = {};
  $scope.application.workFrom = {};
  $scope.application.workTo = {};

  $scope.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  //get the latest restaurantId of the user, because the user might have multiple restaurants
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
  $scope.hstep = 1;
  $scope.mstep = 30;
  var timeFrom = new Date();
  var timeTo = new Date();
  timeFrom.setHours(9);
  timeFrom.setMinutes(0);
  timeTo.setHours(18);
  timeTo.setMinutes(0);

  //funtion to set the default time if a day is checked, if unchecked the day will be set to zero
  $scope.setDefaultTime = function(day, checked) {
    if (checked) {
      $scope.application.workFrom[day] = timeFrom;
      $scope.application.workTo[day] = timeTo;
    } else {
      $scope.application.workFrom[day] = null;
      $scope.application.workTo[day] = null;
    }
  };

  // function to validate the business time
  $scope.validateTime = function(day) {
    if ($scope.application.workFrom[day] > $scope.application.workTo[day]) {
      return true;
    } else {
      return false;
    }
  };



  // function to change the tab view
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
    Restaurant.prototype$updateAttributes({
      id: $scope.restaurantId
    }, $scope.application);

    Restaurant.menus.create({
      id: $scope.restaurantId
    }, $scope.menu);
    $scope.restaurantProfile.$setPristine();
    $state.go('app', {
      reload: true
    });
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

.controller('RatingController', ['$scope', '$state', '$http', '$stateParams', 'User', 'Restaurant', 'Feedback', function($scope, $state, $http, $stateParams, User, Restaurant, Feedback) {
  $scope.max = 5;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

  // check if the user has rated this restaurant, show the rating based on that
  // TODO: make the rating look like the user already rated
  $scope.userFeedback = User.feedbacks({
    id: 'me',
    filter: {
      where: {
        restaurantId: $scope.restaurantId
      }
    }
  }).$promise.then(
    function(response) {
      $scope.userFeedback = response[0];
      if (response[0]) {
        $scope.userRated = true;
      } else {
        $scope.userRated = false;
      }

      //function to submit the user rating
      $scope.newFeedback = function() {
        // if the user already rated, just update the user rating
        if (response[0]) {
          response[0].rate = $scope.userFeedback.rate;
          response[0].$save();
          // update the restaurant average rate when the user updates their rating
          // TODO: make this live update
          $http.get('api/feedbacks/' + $scope.restaurantId + '/avgFeedback');
        }
        // otherwise create a new user rate and calculate the restaurant's average rate
        else {
          User.feedbacks.create({
            id: 'me'
          }, {
            rate: $scope.restaurant.avgRate,
            restaurantId: $scope.restaurantId
          });
          // update the restaurant average rate when the user updates their rating
          // TODO: make this live update
          $http.get('api/feedbacks/' + $scope.restaurantId + '/avgFeedback');
        }
      };
    });


}])

.controller('RestaurantController', ['$scope', '$state', '$stateParams', '$filter', '$http', 'User', 'Restaurant', function($scope, $state, $stateParams, $filter, $http, User, Restaurant) {

  // get the name of today to show the working hours accordingly
  $scope.today = $filter('date')(new Date(), 'EEEE');

  // query all the needed information
  $scope.profile = User.identities({
    id: 'me'
  });

  $http.get('api/restaurants?filter[where][restaurantName]=' + $stateParams.name + '&filter[where][city]=' + $stateParams.city).success(function(data) {
    $scope.restaurants = data;
    $scope.restaurantId = data[0].id;

    // check if the restaurant is open or closed
    $http.get('api/restaurants/' + $scope.restaurantId + '/openOrClosed').success(function(data) {
      $scope.state = data;
    });

  });

}])

.controller('SearchController', ['$scope', '$state', '$stateParams', '$http', 'User', 'Restaurant', function($scope, $state, $stateParams, $http, User, Restaurant) {

  $scope.keyword = $stateParams.keyword;
  $http.get('api/restaurants?filter={"where":{"restaurantName":{"like":"' + $scope.keyword + '","options":"i"}}}').success(function(data) {
    $scope.results = data;

    // check the restaurant's status
    angular.forEach($scope.results, function(value, key) {
      $http.get('api/restaurants/' + value.id + '/openOrClosed').success(function(data) {
        angular.element(document).find("#" + value.id).append(data.openOrClosed);
      });
    });
  });

  // sort the results
  $scope.sortBy = function(propertyName) {
    $scope.propertyName = propertyName;
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
})

// filters
.filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  };
});

// .filter('formatTime', function ($filter) {
// return function (time) {
//     var date = time.substring(0,5);
//     return date;
// };
// });

//
// APP 2 Controllers - shifu
//
angular.module('shifu')

.controller('IndexController', ['$scope', '$state', 'User', function($scope, $state, User) {



}]);
