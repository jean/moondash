function State2Ctrl(items) {
  this.items = items.data.data;
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
    .state('site.state2', {
             url: '/state2',
             section: {
               'title': 'State Two'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state2.partial.html',
                 controller: 'State2Ctrl as ctrl',
                 resolve: {
                   items: function ($http) {
                     return $http.get('/api/users');
                   }
                 }
               }
             }
           })
    .state('site.state3', {
             url: '/state3',
             section: {
               'title': 'State Three'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state3.partial.html'
               }
             }
           });

  // TODO move this around later
  var usersData = {
    data: [
      {
        'id': 'bob',
        'title': 'Bob Jones'
      }
    ]
  };

  moondashMockRestProvider.addMock(
    'users',
    [
      {
        method: 'GET',
        pattern: /api\/users$/,
        responder: function () {
          return [200, usersData];
        }
      }
    ]);
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit)
  .controller('State2Ctrl', State2Ctrl);