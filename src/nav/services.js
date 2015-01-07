'use strict';

function NavMenu (id, label, priority) {
  /* Prototype class that manages a nav menu */

  this.id = id;
  this.label = label;
  this.priority = priority ? priority : 99;
}

function NavService() {

  var _this = this;

  this.menus = {
    root: {label: false, priority: -1, items: {}}
  };

  // Handle top-level menus, aka menu groups
  this.addMenu = function (id, label, priority) {

    _this.menus[id] = {
      label: label,
      priority: priority ? priority : 99,
      items: {}
    }
  };

  this.addMenuItem = function (menuId, menuItem) {
    // Add a menu item to a top-level menu

    // Unpack and repack, just to enforce schema. Later, do this as
    // an actual schema.
    var id = menuItem.id,
      label = menuItem.label,
      priority = menuItem.priority ? menuItem.priority : 99,
      state = menuItem.state,
      params = menuItem.params,
      items = menuItem.items,
      parentItems = _this.menus[menuId].items;

    parentItems[id] = {
      id: id,
      label: label,
      priority: priority,
      state: state,
      items: items
    };

    if (params) parentItems[id].params = params;
  };

  this.init = function (siteconfig) {
    // Given the "nav" key in siteconfig.json, wire things up

    // Extract relevant stuff from config, perhaps validating
    var urlPrefix = siteconfig.urlPrefix,
      items = siteconfig.items;

    // Pluck out the items.root, if it exists, and add any entries to
    // the centrally-defined "root" menu.
    if (items.root) {
      _(items.root).forEach(function (menuItem) {
        var id = menuItem.id,
          label = menuItem.label,
          priority = menuItem.priority,
          state = menuItem.state,
          params = menuItem.params,
          items = menuItem.items;
        _this.addMenuItem(
          'root',
          {
            id: id, label: label, priority: priority, state: state,
            params: params, items: items
          }
        );
      });
      delete items.root;
    }

    // Top-level menus
    _(items).forEach(
      function (menu) {
        var id = menu.id,
          label = menu.label,
          priority = menu.priority,
          items = menu.items;
        _this.addMenu(id, label, priority);

        // Now next level menus
        _(items).forEach(function (menuItem) {
          var id = menuItem.id,
            label = menuItem.label,
            priority = menuItem.priority,
            state = menuItem.state,
            params = menuItem.params,
            items = menuItem.items;
          _this.addMenuItem(
            menu.id,
            {
              id: id, label: label, priority: priority, state: state,
              params: params, items: items
            }
          );

        });

      }
    );
    _this.urlPrefix = _this.urlPrefix;

  }

}

module.exports = {
  NavService: NavService,
  NavMenu: NavMenu
};

