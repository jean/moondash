'use strict';

function NavMenu(id, label, priority) {
  /* Prototype class that manages a nav menu */

  var _this = this;
  this.id = id;
  this.label = label;
  this.priority = priority ? priority : 99;
  this.items = {};

  this.addMenuItem = function (menuItem) {
    var newMenuItem = new NavMenuItem(menuItem);
    _this.items[menuItem.id] = newMenuItem;

    return newMenuItem;
  }
}

function NavMenuItem(menuItem) {
  var _this = this;
  this.id = menuItem.id;
  this.label = menuItem.label;
  this.priority = menuItem.priority ? menuItem.priority : 99;
  this.state = menuItem.state;
  this.params = menuItem.params;
  this.items = menuItem.items;

  // A NavMenuItem can have a submenu
  this.addMenuItem = function (menuItem) {
    var newSubMenuItem = new NavSubMenuItem(menuItem);
    delete newSubMenuItem.items; // Can't have sub-submenus
    _this.items[menuItem.id] = newSubMenuItem;

    return newSubMenuItem;
  }
}

function NavService() {

  var _this = this;
  // By default, we have a built-in "root" menu

  var rootMenu = new NavMenu('root', false, -1);
  this.menus = {
    root: rootMenu
  };

  // Handle top-level menus, aka menu groups
  this.addMenu = function (id, label, priority) {

    var nm = new NavMenu(id, label, priority);
    _this.menus[id] = nm;

    return nm;
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

  this.init = function (menus) {
    // Given the "navMenus" key in siteconfig.json, wire things up

    // Pluck out the items.root, if it exists, and add any entries to
    // the centrally-defined "root" menu.
    if (menus.root) {
      _(menus.root).forEach(function (menuItem) {
        rootMenu.addMenuItem(menuItem);
        //var id = menuItem.id,
        //  label = menuItem.label,
        //  priority = menuItem.priority,
        //  state = menuItem.state,
        //  params = menuItem.params,
        //  items = menuItem.items;
        //_this.addMenuItem(
        //  'root',
        //  {
        //    id: id, label: label, priority: priority, state: state,
        //    params: params, items: items
        //  }
        //);
      });
      delete menus.root;
    }

    // Top-level menus
    _(menus).forEach(
      function (menu) {

        // Does this menu already exist?
        var newMenu = _this.menus[menu.id];
        if (!newMenu) {
          // Make the new menu
          newMenu = _this.addMenu(menu.id, menu.label, menu.priority);
        }

        //var id = menu.id,
        //  label = menu.label,
        //  priority = menu.priority,
        //  items = menu.items;
        //_this.addMenu(id, label, priority);

        // Now next level menus
        _(menu.items).forEach(function (menuItem) {
          newMenu.addMenuItem(menuItem);

          //
          //var id = menuItem.id,
          //  label = menuItem.label,
          //  priority = menuItem.priority,
          //  state = menuItem.state,
          //  params = menuItem.params,
          //  items = menuItem.items;
          //_this.addMenuItem(
          //  menu.id,
          //  {
          //    id: id, label: label, priority: priority, state: state,
          //    params: params, items: items
          //  }
          //);

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

