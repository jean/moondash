'use strict';

var angular = require('angular');
angular.module('md.resourcetypes', ['md.forms', 'ui.router'])
  .service('MdRTypes', require('./services').RTypesService)
  .config(require('./states').Config);
