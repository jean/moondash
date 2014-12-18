(function () {

  function ModuleConfig() {

  }

  function ModuleRun(MdConfig) {
    var config = {
      site: {name: 'mock'},
      navMenus: {
        types: {label: 'Types', priority: 3, items: [
          {label: 'Invoices', priority: 2, state: 'site.features',
          items: [
            {label: 'All', state: 'site.features', priority: 2},
            {label: 'Some', state: 'site.features', priority: 2},
            {label: 'One', state: 'site.features', priority: 2},
          ]},
          {label: 'Reports', priority: 3, state: 'site.features'}
        ]},
        reports: {label: 'Reports', priority: 4, items: [
          {label: 'First Report', state: 'site.features'}
        ]}
      }
    };
    MdConfig.init(config);
  }

  angular.module('full', ['moondash'])
    .config(ModuleConfig)
    .run(ModuleRun);

})();
