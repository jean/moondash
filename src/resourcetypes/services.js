'use strict';

var _ = require('lodash'),
  path = require('path');

function LocalRestangular(Restangular, baseUrl) {
  return Restangular.withConfig(function (RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl(baseUrl);
  });
}

function RTypesService(MdNav) {
  var _this = this;

  // Set the base REST prefix for this site's resourcetypes entry point
  this.urlPrefix = 'api/resourcetypes';

  // Initialize the navmenu
  var menu = MdNav.addMenu('resourcetypes', 'Resource Types', 2);
  menu.addMenuItem({
                     id: 'manage',
                     label: 'Manage',
                     state: 'resourcetypes.manage',
                     priority: 99
                   });

  this.items = {};

  this.init = function (config) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "resourcetypes" part of the JSON.

    // Extract relevant stuff from config, perhaps validating
    //this.urlPrefix = config.urlPrefix;
    var items = config.items;

    _(items).forEach(
      function (resourcetype) {
        _this.items[resourcetype.id] = resourcetype;
        menu.addMenuItem(
          {
            id: resourcetype.id,
            label: resourcetype.label,
            state: 'resourcetype.list',
            params: 'resourcetype: "' + resourcetype.id + '"',
            priority: 5
          }
        );
      }
    );

  }
}

module.exports = {
  RTypesService: RTypesService,
  LocalRestangular: LocalRestangular
};
