'use strict';

var _ = require('lodash');

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
  this.items = menuItem.items ? menuItem.items : {};

  // A NavMenuItem can have a submenu
  this.addMenuItem = function (menuItem) {
    var newSubMenuItem = new NavMenuItem(menuItem);
    //delete newSubMenuItem.items; // Can't have sub-submenus
    this.items[menuItem.id] = newSubMenuItem;

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

  this.init = function (menus) {
    // Given the "navMenus" key in siteconfig.json, wire things up

    // Pluck out the items.root, if it exists, and add any entries to
    // the centrally-defined "root" menu.
    if (menus.root) {
      _(menus.root).forEach(function (menuItem) {
        rootMenu.addMenuItem(menuItem);
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

        // Now next level menus
        _(menu.items).forEach(function (menuItem) {
          newMenu.addMenuItem(menuItem);

        });

      }
    );

  }

}

module.exports = {
  NavService: NavService,
  NavMenu: NavMenu,
  NavMenuItem: NavMenuItem
};

