'use strict';

function RTypesService(MdNav) {
  var _this = this;

  // Set the base REST prefix for this site's rtypes entry point
  this.urlPrefix = 'api/rtypes';

  // Initialize the navmenu
  MdNav.addMenu(
    {id: 'rtypes', label: 'Resource Types', priority: 2}
  );
  MdNav.addMenuItem('rtypes', {
    id: 'manage', label: 'Manage', state: 'rtypes.manage', priority: 99
  });

  this.items = {};

  this.add = function (id, label, schema) {
    _this.items[id] = {
      id: id,
      label: label,
      schema: schema
    };
    MdNav.addMenuItem('rtypes', {
      id: id,
      label: label,
      state: 'rtypes.list',
      params: 'rtype: "' + id + '"',
      priority: 5
    });
  }

  this.init = function (siteconfig) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "rtypes" part of the JSON.

    // Extract relevant stuff from config, perhaps validating
    var urlPrefix = siteconfig.urlPrefix,
      items = siteconfig.items;


    _(items).forEach(
      function (rtype) {
        _this.add(rtype.id, rtype.label);

      }
    );
    _this.urlPrefix = _this.urlPrefix;

  }
}

angular.module('md.resourcetypes')
  .service('MdRTypes', RTypesService);