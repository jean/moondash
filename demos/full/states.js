(function () {
  function ModuleConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
      .state('site', {
               parent: 'root',
               sectionGroup: {
                 label: 'Demo',
                 priority: 2
               }
             })
      .state('site.home', {
               url: '/home',
               title: 'Home',
               section: {
                 group: 'site',
                 label: 'Home',
                 priority: 3
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'home.partial.html'
                 }
               }
             })
      .state('site.features', {
               url: '/features',
               title: 'Features',
               section: {
                 group: 'site',
                 label: 'Features',
                 priority: 4
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'features.partial.html',
                   controller: 'FeaturesCtrl as ctrl',
                   resolve: {
                     resource: function (Restangular) {
                       return Restangular.one('features').get();
                     }
                   }
                 }
               }
             });
  }

  angular.module('full')
    .config(ModuleConfig);

})();
