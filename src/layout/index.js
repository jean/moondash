'use strict';

var angular = require('angular');

angular.module('md.layout', ['ui.router'])
  .service('MdLayout', require('./services').LayoutService)
  .config(require('./states').Config)
  .run(require('./services').Run);
