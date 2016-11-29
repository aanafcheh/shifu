//
// APP 1 Controllers - shifuProfil
//'use strict';

angular.module('shifuProfile')
  .service('commonServices',function(){
    function distanceCalculation(userLat,userLng,restaurantObj,resLat,resLng){

      var R = 6371;
      var dLat = deg2rad(resLat-userLat);  // deg2rad below
      var dLon = deg2rad( resLng-userLng);
      var a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(userLat)) * Math.cos(deg2rad(resLat)) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;

      //this functionality is only for search page for showing distance to each restaurant
      if(restaurantObj!=""){
        restaurantObj.distanceKm=d;
      }
      console.log("The distance is "+ d);
      return d;
    }
    function deg2rad(deg) {

      return deg * (Math.PI/180)
    }
    return {
      distanceCalculation:distanceCalculation
    }
  })



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
      'keyword': $scope.result,
      'noResults': $scope.noResults
    });
  };

}])

.controller('UserController', ['$scope', '$filter', '$state', '$stateParams', '$http', 'User', 'Restaurant', '$uibModal', function($scope, $filter, $state, $stateParams, $http, User, Restaurant, $uibModal) {

  // get the name of today to show the working hours accordingly
  $scope.today = $filter('date')(new Date(), 'EEEE');

  $scope.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  //function for autocomplete google address for restaurant home address
  $scope.initAutocomplete = function() {

    var autocomplete;

    //fields
   var componentForm = {
      route: 'short_name',
      postal_code: 'short_name',
      locality: 'long_name',

      street_number: 'long_name'

    };

    autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('route')), {
        types: ['geocode']
      });

    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();

      console.log(place);
      $scope.application.lat = place.geometry.location.lat();
      $scope.application.lng = place.geometry.location.lng();


      var street;
      for (var i = 0; i < place.address_components.length; i++) {

        var addressType = place.address_components[i].types[0];
        console.log(addressType);

        if (componentForm[addressType]) {

          if (addressType === "street_number") {
            street = place.address_components[i][componentForm[addressType]];

          } else {

            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
          }
        }
      }

      document.getElementById("route").value = document.getElementById("route").value + " " + street;


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

.controller('RestaurantWizardController', ['$scope','commonServices', '$window','$state', '$stateParams', '$uibModal', 'Menu', 'User', 'Restaurant', function($scope,commonServices, $window, $state, $stateParams, $uibModal,Menu, User, Restaurant) {

  $scope.application = {};
  $scope.application.workFrom = {};
  $scope.application.workTo = {};



  //radius selection dialog box
  $scope.openRadiusDialogBox = function (size,lat,lng) {
    $scope.isCollapsed = false;
    $scope.lat=lat;
    $scope.lng=lng;

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'radiusDialogBox.html',
      controller: 'ModalInstanceCtrl',
      size: size,

      resolve: {
        items: function () {
          return $scope.items;
        },
        lat:function () {
          return $scope.lat;
        },
        lng:function () {
          return $scope.lng;
        }
      }
    });
    modalInstance.result.then(function (radius) {
      $scope.application.radius=radius;
    });
  };

  $scope.openComponentModal = function () {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      component: 'modalComponent',
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    }

  $scope.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


  //get the latest restaurantId of the user, because the user might have multiple restaurants
  $scope.restaurants = User.restaurants({
    id: 'me',
    filter: {

      "order": "id DESC",
      "limit": 1,
    }
  }).$promise.then(function(response) {
    $scope.restaurants = response[0];
    $scope.restaurantId = response[0].id;
    $scope.response=response;
    $scope.lat=response[0].lat;
    $scope.lng=response[0].lng;


  });

  //get the latest restaurantId of the user, because the user might have multiple restaurants


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
      controller: 'ImageModelController',
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
    // TODO: make the website reload so the new info is loaded
    $state.go('app', {
      reload: true
    });
  };

}])



.controller('ModalInstanceCtrl', ['$scope', '$state', 'FileUploader', '$uibModalInstance', 'User','lat','lng',function($scope, $state, FileUploader, $uibModalInstance, User,lat,lng) {



  // cropped image will be saved here
  $scope.image = "";

  //radius map for delivery zone
  var map, restaurantMarker, referenceAddressMarker, resLocationLatLng,boundary;
  $scope.getRadius=function(){
    if(!map){
      resLocationLatLng = {lat: lat, lng: lng};
      map = new google.maps.Map(document.getElementById('radiusMap'), {
        center: resLocationLatLng,
        scrollwheel: true,
        zoom: 14
      });
      restaurantMarker = new google.maps.Marker({
        position: resLocationLatLng,
        map: map
      });
    }
    //monitor change in radius input
    $scope.$watch('radius',function() {

      if(referenceAddressMarker){
        referenceAddressMarker.setMap(null);
      }
      if(boundary){
        boundary.setMap(null);
      }
      if($scope.radius!=null){
        boundary = new google.maps.Circle({
          map: map,
          radius:$scope.radius*1000,
          fillColor: 'green',
          fillOpacity: 0.3,
          strokeColor: 'green',
          strokeOpacity: 0.5,
          center:resLocationLatLng
        });

        //fixing the zoom level
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(boundary.getBounds().getNorthEast());
        bounds.extend(boundary.getBounds().getSouthWest());
        map.fitBounds(bounds);
      }
      if($scope.radius===undefined){
        if(boundary){
          boundary.setMap(null);
        }
      }


    });



  }
  $scope.done=function(){
    $uibModalInstance.close($scope.radius);
  }

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

.controller('MenuModalController', ['$scope', '$state', '$http', 'FileUploader', '$uibModalInstance', '$stateParams', 'User', 'Restaurant', 'menu', function($scope, $state, $http, FileUploader, $uibModalInstance, $stateParams, User, Restaurant, menu) {

  // list of allergies to be added to menu items
  $scope.allergies = ["celery", "gluten", "crustaceans", "eggs", "fish", "lupin", "milk", "molluscs", "mustard", "nuts", "peanuts"];

  // get the menu information that are injected to this controller
  $scope.menu = menu;

  // query the restaurant info
  $http.get('api/users/me/restaurants?filter[where][restaurantName]=' + $stateParams.name + '&filter[where][city]=' + $stateParams.city).success(function(data) {
    $scope.restaurants = data;
    $scope.restaurantId = data[0].id;
  });

  $scope.ok = function() {
    $scope.addMenuItem();
    $uibModalInstance.close($scope.menu);
  };

  $scope.save = function() {
    $scope.saveMenuItem();
    $uibModalInstance.close($scope.menu);
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  };

  // function to add a new menu item
  // TODO: add validation
  $scope.addMenuItem = function() {
    Restaurant.menus.create({
      id: $scope.restaurantId
    }, $scope.menu);
    $scope.newMenuItem.$setPristine();
  };

  // function to update a menu item
  $scope.saveMenuItem = function() {
    $http.put('api/menus/' + $scope.menu.id, $scope.menu);
    $scope.newMenuItem.$setPristine();
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


.controller('RestaurantController', ['$scope', 'commonServices','$state', '$stateParams', '$filter', '$http', '$uibModal','User', 'Restaurant', function($scope,commonServices, $state, $stateParams, $filter, $http,$uibModal, User, Restaurant) {





  // get the name of today to show the working hours accordingly
  $scope.today = $filter('date')(new Date(), 'EEEE');

  // query all the needed information
  $scope.profile = User.identities({
    id: 'me'
  });

  // get the restaurant info
  $http.get('api/restaurants?filter[include]=menus&filter[where][restaurantName]=' + $stateParams.name + '&filter[where][city]=' + $stateParams.city).success(function(data) {
    $scope.restaurants = data;
    $scope.restaurantId = data[0].id;

      $scope.travelMeduim="";
      console.log(data);
    //check for delivery and user loccation
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        $scope.permission=true;
        $scope.radius=data[0].radius;
        $scope.userLat=position.coords.latitude;
        $scope.userLng= position.coords.longitude;
        console.log($scope.userLat+" "+ $scope.userLng+ " "+ data[0].lat+" "+ data[0].lng);
        $scope.currentLocDistanceToRes=commonServices.distanceCalculation($scope.userLat,$scope.userLng,"",data[0].lat,data[0].lng);
        console.log("The distance "+ $scope.currentLocDistanceToRes);
        if(data[0].radius>=$scope.currentLocDistanceToRes){
          $scope.deliveryToCurrentLocation=true;
          $scope.currentLocDistanceToRes=Math.round($scope.currentLocDistanceToRes*10)/10;


        }
        else{
          $scope.deliveryToCurrentLocation=false;
          $scope.currentLocDistanceToRes=Math.round($scope.currentLocDistanceToRes*10)/10;
        }

    $scope.menus = data[0].menus;

    // check if the restaurant has a menu
    if ($scope.menus[0]) {
      $scope.hasMenu = false;
    }
    else {
      $scope.hasMenu = true;
    }


      });
    }





    // check if the restaurant is open or closed
    $http.get('api/restaurants/' + $scope.restaurantId + '/openOrClosed').success(function(data) {
      $scope.state = data;
    });

    // **************************
    // maps and direction services
    // **************************
    var travelDetailsInfoWindow;
    $scope.loadMap = function(lat, lng) {
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();
      var resLocationLatLng = {
        lat: lat,
        lng: lng
      };

      var map = new google.maps.Map(document.getElementById('map'), {
        center: resLocationLatLng,
        scrollwheel: true,
        fullscreenControl: true,
        zoom: 14,
      });
      var marker = new google.maps.Marker({
        position: resLocationLatLng,
        map: map
      });
      directionsDisplay.setMap(map);

      // function to get the direction from a restaurant to a user address with differnt meduims
      $scope.changeMeduim = function() {
        if (travelDetailsInfoWindow) {
          travelDetailsInfoWindow.close();
        }
        directionServiceRender(directionsService, directionsDisplay, resLocationLatLng, map);
      };
    };

    //route render
    function directionServiceRender(directionService, directionsDisplay, resLocationLatLng, map) {
      console.log($scope.travelMeduim);
      directionService.route({
        origin: resLocationLatLng,
        destination: {
          lat: $scope.userLat,
          lng: $scope.userLng
        }, //user coordinates goes here
        travelMode: $scope.travelMeduim

      }, function(response, status) {
        var length = parseInt(response.routes[0].legs[0].steps.length);

        var step = Math.round(length / 2);


        if (status === "OK") {
          var details = '<b>' + "Distance: " + "</b>" + response.routes[0].legs[0].distance.text + '<br>' +
            "<b>" + "Time: " + "</b>" + response.routes[0].legs[0].duration.text + "</b>";
          directionsDisplay.setDirections(response);
          travelDetailsInfoWindow = new google.maps.InfoWindow({
            content: details

          });
          travelDetailsInfoWindow.setPosition(response.routes[0].legs[0].steps[step].end_location);

        } else {
          window.alert("Direction service failed. Sorry for inconvience");
        }
        travelDetailsInfoWindow.open(map);
      });
    }

  });

  // add menu item model and pass the menu details as a parameter in case we want to update a specific item
  $scope.open = function(size, menu) {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: '../../views/restaurant/addMenu.html',
      controller: 'MenuModalController',
      size: size,
      resolve: {
        menu: function() {
          return menu;
        }
      }
    });

    modalInstance.result.then(function(menu) {
      $scope.menu = menu;
    });
  };

  // edit the menu
  $scope.delete = function(dishId) {
    $http.delete('api/menus/' + dishId);
  };

}])

.controller('SearchController',['$scope', '$state', '$stateParams', '$http', 'User', 'Restaurant','commonServices', function($scope, $state, $stateParams, $http, User, Restaurant,commonServices) {
  $scope.propertyName="distanceKm";
  //var value=commonServices.distanceCalculation(12,13);

  $scope.getUserLocation=function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        $scope.lat = position.coords.latitude;
        $scope.lng = position.coords.longitude;
        $scope.gotUserLocation=true;
        console.log($scope.lat + " " + $scope.lng);

      });
    }
  }


  $scope.weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // default values of the sorting functions
  $scope.propertyNameStatic = "distanceKm";
  $scope.propertyName = "distanceKm";
  $scope.sort = "Distance";
  $scope.ascDes = "asc";

  // search box values
  $scope.keyword = $stateParams.keyword;
  $scope.noResults = $stateParams.noResults;

  // restaurant results
  $http.get('api/restaurants?filter={"where":{"restaurantName":{"like":"' + $scope.keyword + '","options":"i"}}}').success(function(data) {
    $scope.results = data;


    //function to calcualte distance from two lats/lngs
    $scope.distance=function(lat,lng,obj){
     return Math.round((commonServices.distanceCalculation(lat,lng,obj,$scope.lat,$scope.lng))*10)/10;
    }


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
    $scope.propertyNameStatic = propertyName;
  };

  $scope.sortReverse = function() {
    if ($scope.ascDes === "asc") {
      $scope.propertyName = "-" + $scope.propertyName;
    } else {
      $scope.propertyName = $scope.propertyNameStatic;
    }
  };


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


  //permission to trace user current location when user visit to landing page
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      $scope.lat=position.coords.latitude;
      $scope.lng= position.coords.longitude;
      console.log($scope.lat +" "+ $scope.lng);

    });
  }

}]);
