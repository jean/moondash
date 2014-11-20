'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = [
  'angular'
];

angular.module('moondash', []);

module.exports = require(dependencies);
