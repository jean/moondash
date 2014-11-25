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
               "content@siteroot": {
                 templateUrl: "state3.partial.html"
               }
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);