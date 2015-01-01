'use strict';

var angular = require('angular');
angular.module('md.notice', ['ui.bootstrap.modal'])
  .controller('NoticeController', require('./controllers').NoticeController)
  .service('$notice', require('./services').NoticeService);
