function ModuleConfig($stateProvider) {
  $stateProvider
    .state('types', {
             parent: 'root'
           });
}

function ModuleRun(MdConfig) {
  MdConfig.navMenus.types = {
    label: 'Types', items: [], priority: 2
  };
}

angular.module('md.forms')
  .config(ModuleConfig)
  .run(ModuleRun);
