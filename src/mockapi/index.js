'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

angular.module('md.mockapi', [])
  .provider('MdMockRest', require('./providers').MockRest)
  .run(require('./providers').Run);
