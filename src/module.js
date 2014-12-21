'use strict';

var dependencies = [
  // Our submodules
  'md.common', 'md.forms', 'md.nav', 'md.dispatch', 'md.resourcetypes',

  // External stuff
  'ngSanitize', 'ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse', 'schemaForm'];

var angular = require('angular');

// dist/moondash-vendors.js does NOT include ngMockE2E. Only add that
// dependency and md.mockapi if we have ngMockE2E.
if (angular.mock) {
  dependencies.push('ngMockE2E');
  dependencies.push('md.mockapi');
}

angular.module('moondash', dependencies);

// Require the Moondash components
require('./common');
require('./layout');
require('./configurator');
require('./mockapi');
require('./auth');
require('./hellotesting');
require('./notice');
require('./forms');
require('./nav');
require('./dispatch');
require('./resourcetypes');
require('./common');

