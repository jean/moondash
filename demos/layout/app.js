function PeopleCtrl(res) {
  this.items = res.data;
}

function ModuleInit($stateProvider, $urlRouterProvider, moondashMockRestProvider) {
  $urlRouterProvider.otherwise('/state1');
  $stateProvider
    .state('site', {
             parent: 'root'
           })
    .state('site.state1', {
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
    .state('site.people', {
             url: '/people',
             title: 'People',
             section: {
               'title': 'People'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'people.partial.html',
                 controller: 'PeopleCtrl as ctrl',
                 resolve: {
                   res: function (Restangular) {
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
        pattern: /api\/people$/, responseData: peopleData
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
  .config(ModuleInit)
  .controller('PeopleCtrl', PeopleCtrl);