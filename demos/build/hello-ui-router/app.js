function ModuleInit($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("root.state1", {
             url: '/state1',
             section: {
               'title': 'State One'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state1.partial.html'
               }
             }
           })
    .state("root.state2", {
             url: '/state2',
             section: {
               'title': 'State Two'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state2.partial.html'
               }
             }
           })
    .state("root.state3", {
             url: '/state3',
             section: {
               'title': 'State Three'
             },
             views: {
               '@': {
                 templateUrl: 'state3.partial.html'
               }
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);