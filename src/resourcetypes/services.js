'use strict';

function RTypesService(MdConfig) {

  // Initialize the navmenu
  MdConfig.navMenus.rtypes = {
    label: 'Resource Types', priority: 2, items: [
      {label: 'Manage', state: 'rtypes.manage', priority: 99}
    ]
  };

  var _this = this,
    navMenu = MdConfig.navMenus.rtypes;

  this.rtypes = {};

  this.add = function (id, label) {
    _this.rtypes.id = {
      id: id,
      label: label
    };
    // Now register with config.navMenus.rtypes
    navMenu.items.push(
      {
        label: label,
        state: 'rtypes.list',
        params: 'rtype: "' + id + '"',
        priority: 5
      }
    )
  }
}

angular.module('md.resourcetypes')
  .service('MdRTypes', RTypesService);