'use strict';

function MdNav($rootScope, MdConfig) {
  var _this = this;

  this.sortedMenus = [];

  // Make a watch. Whenever the config changes, compile the nav menu
  $rootScope.$watch(
    function () {
      return MdConfig.navMenus;
    },
    function () {
      _this.sortedMenus = _(MdConfig.navMenus)
        .sortBy('priority')
        .values();
      console.debug('navMenu changed in watcher', MdConfig.navMenus);
      _this.sortedMenus.push(33);
    }
  );
}

function ModuleRun($timeout, MdConfig) {
  var navMenus, site;

  site = {name: 'Some Site'};

  navMenus = [
    {
      id: 'types', title: 'Types', priority: 3,
      menuitems: []
    },
    {
      id: 'reports', title: 'Reports', priority: 4,
      menuitems: []
    }
  ];

  var config = {navMenus: navMenus, site: site};

  $timeout(
    function () {
      MdConfig.init(config);
    },
    500
  );
}

angular.module("moondash")
  .service('MdNav', MdNav)
  .run(ModuleRun);
