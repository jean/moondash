'use strict';

function MdConfig() {
  var _this = this;

  this.site = {name: 'Moondash'};
  this.navMenus = {};

  // Given some JSON data, call each part of a possible configuration
  this.init = function (settings) {
    // Take declarative configuration and augment/replace any
    // imperative configuration.
    _this.site = settings.site;
    _this.navMenus = settings.navMenus;
  };

}

angular.module("moondash")
  .service('MdConfig', MdConfig);