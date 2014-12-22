function MdNavService() {

  var _this = this;

  this.menus = {
    root: {label: false, priority: -1, items: {}}
  };

  // Handle top-level menus, aka menu groups
  this.addMenu = function (menu) {

    // Unpack and repack, just to enforce schema. Later, do this as
    // an actual schema.
    var id = menu.id,
      label = menu.label,
      priority = menu.priority ? menu.priority : 99;

    _this.menus[id] = {
      id: id,
      label: label,
      priority: priority,
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
    }

    if (params) parentItems[id].params = params;
  };


}

angular.module('md.nav')
  .service('MdNav', MdNavService);