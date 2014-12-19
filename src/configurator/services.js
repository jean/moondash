'use strict';

function MdConfig() {
  var _this = this;

  this.site = {name: 'Moondash'};

  // By default we have a 'root' navMenu
  this.navMenus = {
    root: {label: false, priority: -1, items: []}
  };

  // Given some JSON data, call each part of a possible configuration
  this.init = function (settings) {
    // Take declarative configuration and augment/replace any
    // imperative configuration.
    _this.site = settings.site;

    // Don't overwrite menu, instead, augment
    var thisMenu;
    _(settings.navMenus).forEach(function (menu, id) {

      // Get menu if it exists, if not, make one
      thisMenu = _this.navMenus[id];
      if (!thisMenu) {
        thisMenu = _this.navMenus[id] = menu;
      } else {
        // Top-level menu exists, so we augment it
        console.debug('m', thisMenu, _this.navMenus[id]);
      }
    });
    //_this.navMenus = settings.navMenus;
  };

}

angular.module("moondash")
  .service('MdConfig', MdConfig);