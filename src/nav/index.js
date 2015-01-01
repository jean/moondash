'use strict';

var angular = require('angular');
angular.module('md.nav', [])
  .service('MdNav', require('./services').NavService)
  .directive('mdNavmenu', require('./directives').NavMenu)
  .directive('mdNavsubmenu', require('./directives').NavSubmenu)
  .directive('mdNavpanel', require('./directives').NavPanel);
