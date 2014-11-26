function ModuleInit($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/md-layout.partial.html',
             controller: 'LayoutCtrl as ctrl'
           });
}

angular.module('moondash')
  .config(ModuleInit);