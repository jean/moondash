'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

require('./providers');

// TODO Not sure if there is a way, now that we are using CommonJS, to
// eliminate this little IIFE.

(function (mod) {
  'use strict';

  mod.run(function ($httpBackend, MdMockRest) {

    MdMockRest.registerMocks($httpBackend);

    // pass through everything else
    $httpBackend.whenGET(/\/*/).passThrough();
    $httpBackend.whenPOST(/\/*/).passThrough();
    $httpBackend.whenPUT(/\/*/).passThrough();

  });

}(angular.module('md.mockapi', [])));