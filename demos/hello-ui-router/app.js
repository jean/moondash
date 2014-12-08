function ModuleConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("root.state1", {
             url: '/state1',
             section: {
               group: 'root',
               label: 'State One'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'templates/state1.html'
               }
             }
           })
    .state("root.state2", {
             url: '/state2',
             section: {
               group: 'root',
               label: 'State Two'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'templates/state2.html'
               }
             }
           })
    .state("root.state3", {
             url: '/state3',
             section: {
               group: 'root',
               label: 'State Three'
             },
             views: {
               '@': {
                 templateUrl: 'templates/state3.html'
               }
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleConfig);