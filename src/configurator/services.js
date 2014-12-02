'use strict';

function ModuleInit(RestangularProvider) {
  RestangularProvider.setBaseUrl('/api');
}

function MdConfig() {
  this.siteName = 'Moondash';
}


angular.module("moondash")
  .config(ModuleInit)
  .service('MdConfig', MdConfig);
