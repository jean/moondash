'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

/*
TODO This needs to be put in browserify to get into moondash-vendors
instead of moondash.js. But it's complicated:
- angular-bootstrap provides an npm package
- But that packaging does not include concatenated version of submodules
- I can't figure out the right namespaces to put into the browser field
 */
require('angular-bootstrap/src/transition/transition');
require('angular-bootstrap/src/modal/modal');
require('angular-bootstrap/src/collapse/collapse');

var dependencies = ['ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse'];

// If ngMock is loaded, it takes over the backend. We should only add
// it to the list of module dependencies if we are in "frontend mock"
// mode. Flag this by putting the class .frontendMock on some element
// in the demo .html page.
var mockApi = document.querySelector('.mockApi');
if (mockApi) {
  dependencies.push('ngMockE2E');
  dependencies.push('moondashMock');
}

var angular = require('angular');
angular.module('moondash', dependencies);

// Now the Moondash components
require('./layout');
require('./globalsection');
require('./configurator');
require('./mockapi');
require('./auth');
require('./hellotesting');
require('./notice');
