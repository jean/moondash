function NavPanelCtrl(MdNav) {
  this.menus = MdNav.menus;
}

function NavPanel () {
  return {
    restrict: 'E',
    template: require('./templates/navpanel.html'),
    scope: {},
    controller: NavPanelCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

function NavMenuCtrl() {
  this.sref = function (menuitem) {
    // Generating the ui-sref has some logic. Let's do it here instead
    // of inline.
    var uiSref = menuitem.state;
    if (menuitem.params) {
      uiSref = uiSref + '({' + menuitem.params + '})';
    }
    return uiSref;
  }
}


function NavMenu() {
  return {
    restrict: 'E',
    template: require('./templates/navmenu.html'),
    scope: {
      menuitem: '=ngModel'
    },
    controller: NavMenuCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}


function NavSubmenuCtrl(){
  this.isCollapsed = true;
}


function NavSubmenu() {
  return {
    restrict: 'E',
    template: require('./templates/submenu.html'),
    require: '^ngModel',
    scope: {
      menuitem: '=ngModel'
    },
    controller: NavSubmenuCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  }
}


angular.module('md.nav')
  .directive('mdNavmenu', NavMenu)
  .directive('mdNavsubmenu', NavSubmenu)
  .directive('mdNavpanel', NavPanel);