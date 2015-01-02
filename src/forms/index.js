'use strict';

var angular = require('angular');

angular.module('md.forms', ['ui.router', 'restangular'])
  .service('MdSchemas', require('./services').SchemasService)
  .service('MdForms', require('./services').FormsService)
  .directive('mdForm', require('./directives').FormDirective);
