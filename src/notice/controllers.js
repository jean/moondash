function NoticeController($scope, $modalInstance, $timeout, message) {
  this.message = message;
  var seconds = 3;
  var timer = $timeout(
    function () {
      $modalInstance.dismiss();
    }, seconds * 1000
  );
  $scope.$on(
    'destroy',
    function () {
      $timeout.cancel(timer);
    });
}

module.exports = {
  NoticeController: NoticeController
};
