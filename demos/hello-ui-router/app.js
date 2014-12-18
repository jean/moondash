function ModuleConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("root.state1", {
             url: '/state1',
             views: {
               'md-content@root': {
                 templateUrl: 'templates/state1.html'
               }
             }
           })
    .state("root.state2", {
             url: '/state2',
             views: {
               'md-content@root': {
                 templateUrl: 'templates/state2.html'
               }
             }
           })
    .state("root.state3", {
             url: '/state3',
             views: {
               '@': {
                 templateUrl: 'templates/state3.html'
               }
             }
           });
}

function ModuleRun(MdConfig) {
    MdConfig.navMenus.root.items
      .push({label: 'State 1', state: 'root.state1'});
    MdConfig.navMenus.root.items
      .push({label: 'State 2', state: 'root.state2'});
    MdConfig.navMenus.root.items
      .push({label: 'State 3', state: 'root.state3'});
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleConfig)
  .run(ModuleRun);