angular.module('solomo.controllers')

    .controller('PostCtrl', function($scope, UserService, $ionicActionSheet, $state, $ionicLoading,$cordovaCamera) {
      $scope.photos = [];
      $scope.choosePicture = function(){
          $scope.imageHandle(Camera.PictureSourceType.PHOTOLIBRARY);
      };

      $scope.takePicture = function(){
          $scope.imageHandle(Camera.PictureSourceType.CAMERA);
      };

      $scope.imageHandle = function(Type) {
          var options = {
              quality : 75,
              destinationType : Camera.DestinationType.DATA_URL,
              sourceType : Type,
              allowEdit : true,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 300,
              targetHeight: 300,
              popoverOptions: CameraPopoverOptions,
              saveToPhotoAlbum: true
              };

          $cordovaCamera.getPicture(options).then(function(imageData) {
              var imgURI = "data:image/jpeg;base64," + imageData;
              $scope.img = imageData;
              $scope.photos.push(imgURI);

              console.log(imgURI);
              var cameraImage = document.getElementById('image');
              cameraImage.style.display = 'block';
              cameraImage.src = imgURI;
          }, function(err) {
             console.log(err);
          });
    }
  });