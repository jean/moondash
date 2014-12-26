'use strict';

function MdConfig() {
  var _this = this;

  this.site = {name: 'Moondash'};

}

angular.module("moondash")
  .service('MdConfig', MdConfig);