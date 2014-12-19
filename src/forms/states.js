function ModuleConfig($stateProvider) {
  $stateProvider
  .state('types', {
    parent: 'root',
    sectionGroup: {
      label: 'Types',
      priority: 1
    }
  });
}

angular.module('md.forms')
.config(ModuleConfig);
