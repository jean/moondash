'use strict';

var angular = require('angular');

angular.module('md.forms', ['ui.router', 'restangular'])
  .controller('FormCtrl', require('./controllers').FormCtrl)
  .service('MdSchemas', require('./services').SchemasService)
  .service('MdForms', require('./services').FormsService);

require('./directives');