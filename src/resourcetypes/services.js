'use strict';

var _ = require('lodash');

function RTypesService(MdNav) {
  var _this = this;

  // Set the base REST prefix for this site's rtypes entry point
  this.urlPrefix = 'api/rtypes';

  // Initialize the navmenu
  var menu = MdNav.addMenu('rtypes', 'Resource Types');
  menu.addMenuItem({
                     id: 'manage',
                     label: 'Manage',
                     state: 'rtypes.manage',
                     priority: 99
                   });

  this.items = {};

  this.init = function (config) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "rtypes" part of the JSON.

    // Extract relevant stuff from config, perhaps validating
    var items = config.items;

    _(items).forEach(
      function (rtype) {
        menu.addMenuItem(
          {
            id: rtype.id,
            label: rtype.label,
            state: 'rtypes.list',
            params: 'rtype: "' + rtype.id + '"',
            priority: 5
          }
        );
      }
    );

  }
}

module.exports = {
  RTypesService: RTypesService
};
