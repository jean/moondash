function ModuleInit($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("site.state1", {
             url: 'state1',
             templateUrl: 'state1.partial.html',
             section: {
               'title': 'State One'
             }
           })
    .state("site.state2", {
             url: 'state2',
             templateUrl: 'state2.partial.html',
             section: {
               'title': 'State Two'
             }
           })
    .state("site.state3", {
             url: 'state3',
             templateUrl: 'state3.partial.html',
             section: {
               'title': 'State Three'
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);