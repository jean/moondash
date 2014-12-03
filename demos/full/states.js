function ModuleConfig($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('site', {
             parent: 'root',
             sectionGroup: {
               label: 'Demo',
               priority: 2
             }
           })
    .state('site.state1', {
             url: '/state1',
             section: {
               group: 'site',
               label: 'State One',
               priority: 3
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state1.partial.html'
               }
             }
           })
    .state('site.people', {
             url: '/people',
             title: 'People',
             section: {
               group: 'site',
               label: 'People',
               priority: 4
             },
             views: {
               'md-content@root': {
                 templateUrl: 'people.partial.html',
                 controller: 'PeopleCtrl as ctrl',
                 resolve: {
                   resource: function (Restangular) {
                     return Restangular.one('people').get();
                   }
                 }
               }
             }
           });
  $urlRouterProvider.otherwise('/state1');
}

angular.module('full')
  .config(ModuleConfig);