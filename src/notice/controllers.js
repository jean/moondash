function NoticeCtrl($modalInstance, message) {
  this.message = message;
}

angular.module('moondash')
  .controller('NoticeCtrl', NoticeCtrl);