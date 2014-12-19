'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

require('./providers');

function ModuleRun ($httpBackend, MdMockRest) {
    MdMockRest.registerMocks($httpBackend);

    // pass through everything else
    $httpBackend.whenGET(/\/*/).passThrough();
    $httpBackend.whenPOST(/\/*/).passThrough();
    $httpBackend.whenPUT(/\/*/).passThrough();

}

angular.module('md.mockapi', [])
  .run(ModuleRun);