var moondash = require('angular').module('moondash');

moondash.directive(
  'hello',
  function () {
    return {
      templateUrl: 'auth/twitter/login.partial.html'
    }
  }
);