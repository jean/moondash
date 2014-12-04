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
      .state('site.collapse', {
               url: '/collapse',
               title: 'Collapse',
               section: {
                 group: 'site'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'collapse.partial.html',
                   controller: 'CollapseCtrl as ctrl'
                 }
               }
             })
      .state('site.form', {
               url: '/form',
               title: 'Form',
               section: {
                 group: 'site'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'form.partial.html',
                   controller: 'FormCtrl as ctrl'
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
               authenticate: true,
               section: {
                 group: 'security',
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
                 priority: 3
               },
               views: {
                 'md-content@root': {
                   template: '<h1>Backend Security</h1>',
                   resolve: {
                     resource: function (Restangular) {
                       return Restangular.one('security/backend').get();
                     }
                   }
                 }
               }
             })
      .state('security.forbidden', {
               url: '/forbidden',
               title: 'Forbidden',
               section: {
                 group: 'security',
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
