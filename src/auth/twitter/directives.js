var angular = require('angular');

angular.module('moondash')
  .directive(
  'hello',
  function () {
    return {
      templateUrl: 'auth/twitter/login.partial.html'
    }
  }
);