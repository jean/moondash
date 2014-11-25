'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

// List some dependencies
require('angular-ui-router');

var angular = require('angular');
angular.module('moondash', ['ui.router']);

var auth = require('./auth');

