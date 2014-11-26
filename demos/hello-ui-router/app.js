function ModuleInit($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("site.state1", {
             url: 'state1',
             section: {
               'title': 'State One'
             },
             templateUrl: 'state1.partial.html'
           })
    .state("site.state2", {
             url: 'state2',
             section: {
               'title': 'State Two'
             },
             templateUrl: 'state2.partial.html'
           })
    .state("site.state3", {
             url: 'state3',
             section: {
               'title': 'State Three'
             },
             views: {
               '@': {
                 template: '<h1>state3 hijacked the Moondash layout</h1>'
               }
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);