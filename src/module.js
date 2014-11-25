'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var angular = require('angular');

var auth = require('./auth');
console.log(auth);
auth.twitter.login();

angular.module('moondash', []);