'use strict';

function ModuleConfig(RestangularProvider) {
  RestangularProvider.setBaseUrl('/api');
}

function MdConfig() {
  this.siteName = 'Moondash';
}


angular.module("moondash")
  .config(ModuleConfig)
  .service('MdConfig', MdConfig);
