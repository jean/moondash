'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = [
  // Our submodules
  'md.forms', 'md.nav',

  // External stuff
  'ngSanitize', 'ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse', 'schemaForm'];

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

// Require the Moondash components
require('./layout');
require('./configurator');
require('./mockapi');
require('./auth');
require('./hellotesting');
require('./notice');
require('./forms');
require('./nav');
