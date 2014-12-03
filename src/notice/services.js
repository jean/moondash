function NoticeService($modal) {
  this.show = function (message) {
    var modalInstance = $modal.open(
      {
        templateUrl: 'noticeModal.html',
        controller: 'NoticeCtrl as ctrl',
        size: 'sm',
        resolve: {
          message: function () {
            return message;
          }
        }
      });

    modalInstance.result.then(function () {

    });

  }
}

angular.module('moondash')
  .service('$notice', NoticeService);