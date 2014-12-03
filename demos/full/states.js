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
             })
      .state('security', {
               parent: 'site',
               sectionGroup: {
                 label: 'Security and Errors',
                 priority: 2
               }
             })
      .state('security.overview', {
               url: '/overview',
               title: 'Overview',
               section: {
                 group: 'security',
                 label: 'Overview',
                 priority: 0
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'security.overview.partial.html'
                 }
               }
             })
      .state('security.none', {
               url: '/none',
               title: 'No Security',
               section: {
                 group: 'security',
                 label: 'No Security',
                 priority: 1
               },
               views: {
                 'md-content@root': {
                   template: '<h1>No Security Needed</h1>'
                 }
               }
             })
      .state('security.frontend', {
               url: '/frontend',
               title: 'Frontend Marker',
               section: {
                 group: 'security',
                 label: 'Frontend Marker',
                 priority: 2
               },
               views: {
                 'md-content@root': {
                   template: '<h1>Frontend Security</h1>'
                 }
               }
             })
      .state('security.backend', {
               url: '/backend',
               title: 'Backend Marker',
               section: {
                 group: 'security',
                 label: 'Backend Marker',
                 priority: 3
               },
               views: {
                 'md-content@root': {
                   template: '<h1>Backend Security</h1>'
                 }
               }
             })
      .state('security.forbidden', {
               url: '/forbidden',
               title: 'Forbidden',
               section: {
                 group: 'security',
                 label: 'Forbidden',
                 priority: 4
               },
               views: {
                 'md-content@root': {
                   template: '<h1>Forbidden Resource</h1>'
                 }
               }
             })

      .state('security.error', {
               url: '/error',
               title: 'Error',
               section: {
                 group: 'security',
                 label: 'Error',
                 priority: 5
               },
               views: {
                 'md-content@root': {
                   template: '<h1>Some Error Page</h1>'
                 }
               }
             });
  }

  angular.module('full')
    .config(ModuleConfig);

})();
