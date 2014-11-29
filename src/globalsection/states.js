function ModuleInit($stateProvider) {
  $stateProvider
    .state('root.dashboard', {
             url: 'dashboard',
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleInit);