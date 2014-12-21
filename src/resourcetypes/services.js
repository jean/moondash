'use strict';

function RTypesService(MdConfig) {

  // Set the base REST prefix for this site's rtypes entry point
  this.urlPrefix = 'api/rtypes';

  // Initialize the navmenu
  MdConfig.navMenus.rtypes = {
    label: 'Resource Types', priority: 2, items: [
      {label: 'Manage', state: 'rtypes.manage', priority: 99}
    ]
  };

  var _this = this,
    navMenu = MdConfig.navMenus.rtypes;

  this.items = {};

  this.add = function (id, label, schema) {
    _this.items[id] = {
      id: id,
      label: label,
      schema: schema
    };
    // Now register with config.navMenus.rtypes
    // TODO This is awful, had to beat an ng-repeat with items.push
    // digest problem. Guess items needs to be refactored into an object.
    [].push.apply(
      navMenu.items,
      [{
        label: label,
        state: 'rtypes.list',
        params: 'rtype: "' + id + '"',
        priority: 5
      }]
    );
  }
}

angular.module('md.resourcetypes')
  .service('MdRTypes', RTypesService);