function PeopleCtrl(resource) {
  this.items = resource.items;
}

function ModuleConfig($stateProvider, $urlRouterProvider, moondashMockRestProvider) {
  $urlRouterProvider.otherwise('/state1');
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

  // TODO move this around later
  var peopleData = {
    resource: {
      id: 99, title: 'People'
    },
    items: [
      {'id': 1, 'title': 'Ada Lovelace'},
      {'id': 2, 'title': 'Grace Hopper'}
    ]
  };

  moondashMockRestProvider.addMocks(
    'people',
    [
      {
        pattern: /api\/people$/, responseData: peopleData, authenticate: true
      }
      //{
      //  method: 'GET',
      //  pattern: /api\/people$/,
      //  responder: function () {
      //    return [200, peopleData];
      //  }
      //}
    ]);
}

angular.module('layout', ['moondash'])
  .config(ModuleConfig)
  .controller('PeopleCtrl', PeopleCtrl);