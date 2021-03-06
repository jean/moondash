'use strict';

var dependencies = [
  // Our submodules
  'md.common', 'md.config', 'md.layout', 'md.mockapi', 'md.notice',
  'md.auth', 'md.forms', 'md.nav', 'md.dispatch', 'md.resourcetypes',

  // External stuff
  'ngSanitize', 'ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse', 'schemaForm'];

var angular = require('angular');

// Load external dependencies
require('ngSanitize');
require('ui.router');
require('restangular');
require('satellizer');
require('ui.bootstrap.transition');
require('ui.bootstrap.modal');
require('ui.bootstrap.collapse');
require('schemaForm');
require('angular-schema-form-decorator');
require('angular-mocks'); // that one will exclude if not angular.mock

// Some sub dependencies must be global
window._ = require('lodash');
window.ObjectPath = require('ObjectPath').ObjectPath;
window.tv4 = require('tv4');

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
require('./notice');
require('./forms');
require('./nav');
require('./dispatch');
require('./resourcetypes');
require('./common');
