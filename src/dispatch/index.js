'use strict';

var angular = require('angular');

angular.module('md.dispatch', ['ui.router'])
  .controller('NotFoundCtrl', require('./controllers').NotFoundCtrl)
  .controller('ErrorCtrl', require('./controllers').ErrorCtrl)
  .controller('DispatcherCtrl', require('./controllers').DispatcherCtrl)
  .service('MdDispatcher', require('./services').Dispatcher);

require('./init');
require('./controllers');
require('./services');
require('./states');
