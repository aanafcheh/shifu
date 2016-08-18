//
// APP 1 Controllers - shifuProfile
//
//
angular.module('shifuProfile')

.controller('ProfileController', ['$scope', '$state', 'User', function($scope, $state, User) {

  $scope.profile = User.identities({
    id: 'me'
  });


}])

.controller('RestaurantController', ['$scope', '$state', 'User', 'FileUploader', function($scope, $state, User, FileUploader) {

  $scope.profile = User.identities({
    id: 'me'
  });
  $scope.application = [];

  $scope.submitApplication = function() {
    console.log($scope.application);

  };

  //
  //  Uploader
  //
  // create an uploader with options
  var uploader = $scope.uploader = new FileUploader({
    scope: $scope,
    queueLimit: 2,
    url: '/api/containers/files/upload',
    formData: [{
      key: 'value'
    }]
  });

  // auto upload the files after adding
  uploader.onAfterAddingFile = function() {
    // $scope.uploader.uploadAll();
  };

  uploader.onSuccessItem = function(item, response, status, headers) {
    console.info('Success', response, status, headers);
    $scope.$broadcast('uploadCompleted', item);
  };

  uploader.filters.push({
    name: 'sizeLimit',
    fn: function(item) {
      return item.file.size <= 4194304;
    }
  });
  uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/ , options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });


}]);

//
// APP 2 Controllers - shifu
//
angular.module('shifu')

.controller('IndexController', ['$scope', '$state', 'User', function($scope, $state, User) {



}]);
