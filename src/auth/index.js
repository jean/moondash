'use strict';

var angular = require('angular');
angular.module('md.auth', [])
  .filter('LoginCtrl', require('./controllers').LoginCtrl)
  .filter('LogoutCtrl', require('./controllers').LogoutCtrl)
  .filter('ProfileCtrl', require('./controllers').ProfileCtrl)
  .factory('MdProfile', require('./services').Profile);

require('./states');
require('./controllers');
require('./services');
require('./interceptors');

