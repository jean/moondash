function NavMenuCtrl() {
}


function NavMenu() {
  return {
    restrict: 'E',
    templateUrl: '/nav/templates/navmenu.html',
    scope: {
      ngModel: '='
    },
    controller: NavMenuCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

function NavPanelCtrl(MdNav) {
  this.navMenus = MdNav.sortedMenus;
  console.debug('panel ctrl', this.navMenus);
}

function NavPanel () {
  return {
    restrict: 'E',
    templateUrl: '/nav/templates/navpanel.html',
    scope: {
      ngModel: '='
    },
    controller: NavPanelCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module('md.nav')
  .directive('mdNavmenu', NavMenu)
  .directive('mdNavpanel', NavPanel);