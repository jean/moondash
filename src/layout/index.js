'use strict';

var angular = require('angular');

angular.module('md.layout', ['ui.router'])
  .controller('LayoutController', require('./controllers').LayoutController)
  .controller('HeaderController', require('./controllers').HeaderController)
  .controller('FooterController', require('./controllers').FooterController)
  .controller('NavController', require('./controllers').NavController)
  .service('MdLayout', require('./services').LayoutService)
  .run(require('./services').Run);

require('./states');
