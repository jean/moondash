function ModuleInit($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("site.state1", {
             url: 'state1',
             templateUrl: 'state1.partial.html'
           })
    .state("site.state2", {
             url: 'state2',
             templateUrl: 'state2.partial.html'
           })
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);