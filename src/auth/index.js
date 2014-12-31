'use strict';

var angular = require('angular');
angular.module('md.auth', [])
  .controller('LoginCtrl', require('./controllers').LoginCtrl)
  .controller('LogoutCtrl', require('./controllers').LogoutCtrl)
  .controller('ProfileCtrl', require('./controllers').ProfileCtrl)
  .factory('MdProfile', require('./services').Profile);

require('./states');
require('./controllers');
require('./services');
require('./interceptors');

