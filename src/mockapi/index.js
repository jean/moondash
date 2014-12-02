'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

require('./providers');

(function (ng, mod, _, undefined) {
  'use strict';

  mod.run(function ($httpBackend, moondashMockRest) {

    var mocks = moondashMockRest.getMocks();

    // Iterate over all the registered mocks and register them
    _.map(mocks, function (moduleMocks) {
      // All the mocks registered for this module
      _(moduleMocks).forEach(function (mock) {
        var method = mock[0];
        var match = mock[1],
          responder = mock[2];
        $httpBackend.when(
          method,
          match)
          .respond(responder);
      });
    });

    // pass through everything else
    $httpBackend.whenGET(/\/*/).passThrough();
    $httpBackend.whenPOST(/\/*/).passThrough();
    $httpBackend.whenPUT(/\/*/).passThrough();

  });

}(angular, angular.module('moondashMock', ['moondash', 'ngMockE2E']), _));