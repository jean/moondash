'use strict';

require('./states');
require('./controllers');
require('./services');
require('./interceptors')
require('./mocks');

// Module level __init__

function ModuleConfig($authProvider) {
  var baseUrl = '';

  // Satellizer setup
  $authProvider.loginUrl = baseUrl + '/api/auth/login';

}

angular.module('moondash')
  .config(ModuleConfig);