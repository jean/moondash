'use strict';

// Define a submodule
var angular = require('angular');

var dependencies = [
  'ui.router',
  'restangular'
];
angular.module('md.forms', dependencies);

require('./directives');
require('./services');
require('./states');
