'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var angular = require('angular');
angular.module('moondash', ['ui.router']);

// Now the Moondash components
require('./layout');
require('./globalsection');
require('./auth');
