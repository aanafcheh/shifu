//
// APP 1 Controllers - shifuProfil
//'use strict';

angular.module('shifuProfile')
  .service('commonServices',function(){
    function distanceCalculation(lat,lng,obj){

      var R = 6371;
      var dLat = deg2rad(60.2374603-lat);  // deg2rad below
      var dLon = deg2rad( 24.820678000000044-lng);
      var a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(deg2rad(lat)) * Math.cos(deg2rad(60.2374603)) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c;
      if(obj!=""){
      obj.distanceKm=d;
      }
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

  //function for autocomplete google address for restaurant home address
  $scope.initAutocomplete = function() {

    var autocomplete;

    //fields
   var componentForm = {
      route: 'short_name',
      postal_code: 'short_name',
      locality: 'long_name',


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


      var street;
      for (var i = 0; i < place.address_components.length; i++) {

        var addressType = place.address_components[i].types[0];
        console.log(addressType);

        if (componentForm[addressType]) {
          if (addressType==="street_number"){
           street = place.address_components[i][componentForm[addressType]];

          }
          else{
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
          }
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

.controller('RestaurantWizardController', ['$scope','commonServices', '$window','$state', '$stateParams', '$uibModal', 'Menu', 'User', 'Restaurant', function($scope,commonServices, $window, $state, $stateParams, $uibModal, Menu, User, Restaurant) {

  $scope.application = {};
  $scope.application.workFrom = {};
  $scope.application.workTo = {};



  //radius selection dialog box
  $scope.openRadiusDialogBox = function (size) {
    $scope.isCollapsed = false;

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'RestaurantWizardController',

      size: size,

      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {

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

  $scope.restaurantId = User.restaurants({
    id: 'me',
    filter: {

      "order": "id DESC",
      "limit": 1,
    }
  }).$promise.then(function(response) {
    $scope.restaurantId = response[0].id;
    $scope.lat=response[0].lat;
    $scope.lng=response[0].lng;


  });





  //function that handles radius input if user wants to just input radius
  var map, restaurantMarker, referenceAddressMarker, resLocationLatLng,referencelatLng,boundary;
  $scope.getRadius=function(){
    angular.element(document).find("#addressForRadius").val("");
    if(!map){
      resLocationLatLng = {lat: $scope.lat, lng: $scope.lng};
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
    $scope.isCollapsed = true;
    $scope.$watch('radiusValue',function() {

      if(referenceAddressMarker){
        referenceAddressMarker.setMap(null);
      }
      if(boundary){
        boundary.setMap(null);
      }
      console.log($scope.radiusValue);
      if($scope.radiusValue!=null){
      boundary = new google.maps.Circle({
        map: map,
        radius:$scope.radiusValue*1000,
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
      if($scope.radiusValue===undefined){
        if(boundary){
          boundary.setMap(null);
        }
      }

    });



  }

  //intial map loading with autocompelete google search
  $scope.initRadius=function(){
    angular.element(document).find("#radiusValue").val("");
    $scope.isCollapsed = true;
    if(!map){
     resLocationLatLng = {lat: $scope.lat, lng: $scope.lng};
     map = new google.maps.Map(document.getElementById('radiusMap'), {
      center: resLocationLatLng,
      scrollwheel: true,
      zoom: 15
    });
     restaurantMarker = new google.maps.Marker({
      position: resLocationLatLng,
      map: map
    });


    }
    var autocomplete = new google.maps.places.Autocomplete(

      (document.getElementById('addressForRadius')), {
        types: ['geocode']
      });
    function fillInAddress() {

      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();
      var radius=commonServices.distanceCalculation(place.geometry.location.lat(),place.geometry.location.lng(),""); //get radius from commonService distance function
      $scope.radiusModel=Math.ceil(radius);
      referencelatLng={ lat:place.geometry.location.lat(),lng:place.geometry.location.lng()};

      //check if  map is already loaded
      if(map){
        if(referenceAddressMarker){
          referenceAddressMarker.setMap(null);
        }
        if(boundary){
          boundary.setMap(null);
        }
        referenceAddressMarker = new google.maps.Marker({
          position: referencelatLng,
          map: map
        });
        boundary = new google.maps.Circle({
          map: map,
          radius:radius*1000,
          fillColor: 'green',
          strokeColor: 'green',
          strokeOpacity: 0.5,
          fillOpacity: 0.3,
          center:resLocationLatLng
        });

        //fixing zoom level
        var bounds = new google.maps.LatLngBounds();
        bounds.extend(restaurantMarker.getPosition());
        bounds.extend(referenceAddressMarker.getPosition());
        map.fitBounds(bounds);
        console.log("The zoom level "+map.getZoom());
        map.setZoom(map.getZoom()-2);
        map.setCenter(resLocationLatLng);
      }
    }

    autocomplete.addListener('place_changed', fillInAddress);
  }


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
      $scope.travelMeduim="";
    var travelDetailsInfoWindow;
    $scope.changeMedium=function(meduim){
      $scope.travelMeduim=meduim;
    }

    //maps and direction services
    $scope.loadMap=function(lat,lng){
      var directionsService = new google.maps.DirectionsService;
      var directionsDisplay = new google.maps.DirectionsRenderer;
      var resLocationLatLng = {lat: lat, lng: lng};

      var map = new google.maps.Map(document.getElementById('map'), {
        center: resLocationLatLng,
        scrollwheel: true,
        zoom: 15
      });
      var marker = new google.maps.Marker({
        position: resLocationLatLng,
        map: map
      });
      directionsDisplay.setMap(map);
      $scope.onChangeHandler=function(){
        if(travelDetailsInfoWindow){
          travelDetailsInfoWindow.close();
        }

        directionServiceRender(directionsService,directionsDisplay,resLocationLatLng,map);
      };


    }

    //driving route render
    function directionServiceRender(directionService,directionsDisplay,resLocationLatLng,map){
      console.log($scope.travelMeduim);
      directionService.route({
        origin:resLocationLatLng,
        destination:{lat:60.77777, lng:24.6666}, //user coordinates goes here
        travelMode:$scope.travelMeduim

      },function(response,status){
        var length=parseInt(response.routes[0].legs[0].steps.length);

        var step=Math.round(length/2);


        if(status==="OK"){
          var details='<b>'+"Distance: "+"</b>"+ response.routes[0].legs[0].distance.text+'<br>'+
              "<b>"+"Time: "+"</b>"+response.routes[0].legs[0].duration.text+"</b>";
          directionsDisplay.setDirections(response);
           travelDetailsInfoWindow=new google.maps.InfoWindow({
            content:details

          });
          travelDetailsInfoWindow.setPosition(response.routes[0].legs[0].steps[step].end_location);

        }else{
          window.alert("Direction service failed. Sorry for inconvience");
        }
        travelDetailsInfoWindow.open(map);
      });


    }
    // check if the restaurant is open or closed
    $http.get('api/restaurants/' + $scope.restaurantId + '/openOrClosed').success(function(data) {
      $scope.state = data;
    });

  });

}])

.controller('SearchController',['$scope', '$state', '$stateParams', '$http', 'User', 'Restaurant','commonServices', function($scope, $state, $stateParams, $http, User, Restaurant,commonServices) {
  $scope.propertyName="distanceKm";
  //var value=commonServices.distanceCalculation(12,13);





  $scope.keyword = $stateParams.keyword;
  $http.get('api/restaurants?filter={"where":{"restaurantName":{"like":"' + $scope.keyword + '","options":"i"}}}').success(function(data) {
    $scope.results = data;

    //function to calcualte distance from two lats/lngs
    $scope.distance=function(lat,lng,obj){
     return commonServices.distanceCalculation(lat,lng,obj)
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
