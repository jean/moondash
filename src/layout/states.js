function ModuleInit($stateProvider) {
  $stateProvider
    .state('site', {
             abstract: true,
             templateUrl: '/layout/md-layout.partial.html',
             controller: 'LayoutCtrl as ctrl'
           });
}

angular.module('moondash')
  .config(ModuleInit);