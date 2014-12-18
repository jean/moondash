function NavPanelCtrl(MdConfig) {
  this.navMenus = MdConfig.navMenus;

}

function NavPanel () {
  return {
    restrict: 'E',
    templateUrl: '/nav/templates/navpanel.html',
    scope: {},
    controller: NavPanelCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

function NavMenuCtrl() {
}


function NavMenu() {
  return {
    restrict: 'E',
    templateUrl: '/nav/templates/navmenu.html',
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
    restrict: "E",
    templateUrl: "/nav/templates/submenu.html",
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
  .directive("mdNavsubmenu", NavSubmenu)
  .directive('mdNavpanel', NavPanel);