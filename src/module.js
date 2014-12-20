'use strict';

var dependencies = [
  // Our submodules
  'md.forms', 'md.nav', 'md.dispatch', 'md.resourcetypes',

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


// Jamming this on here. Patching String.prototype to add some
// utility functions that aren't in lodash (and I don't want to
// add 7Kb minified to get underscore.string.)

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.substring(0, str.length) === str;
  }
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str) {
    return this.substring(this.length - str.length, this.length) === str;
  }
}
