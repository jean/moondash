'use strict';

function MdConfig() {
  this.siteName = 'Moondash';
}


angular.module("moondash")
  .service('MdConfig', MdConfig);
