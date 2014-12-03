var _ = require('lodash');


function ModalInstanceCtrl ($scope, $modalInstance) {

  $scope.selected = {
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}
function LoginCtrl($auth, $modal, $scope) {


  this.open = function (size) {

    var modalInstance = $modal.open({
                                      templateUrl: 'myModalContent.html',
                                      controller: 'ModalInstanceCtrl',
                                      size: size
                                    });

    modalInstance.result.then(function (selectedItem) {
      this.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };


  this.login = function ($valid, username, password) {
    $auth.login({username: username, password: password})
      .then(function () {
              $alert({
                       content: 'You have successfully logged in',
                       animation: 'fadeZoomFadeDown',
                       type: 'material',
                       duration: 3
                     });
            })
      .catch(function (response) {
               $alert({
                        content: response.data.message,
                        animation: 'fadeZoomFadeDown',
                        type: 'material',
                        duration: 3
                      });
             });
  }
}

function LogoutCtrl() {
}

function ProfileCtrl() {
}

angular.module('moondash')
  .controller('ModalInstanceCtrl', ModalInstanceCtrl)
  .controller('LoginCtrl', LoginCtrl)
  .controller('LogoutCtrl', LogoutCtrl)
  .controller('ProfileCtrl', ProfileCtrl);
