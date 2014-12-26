(function () {
  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('site', {
               parent: 'root'
             })
      .state('site.home', {
               url: '/',
               title: 'Home',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/home.html'
                 }
               }
             })
      .state('site.features', {
               url: '/features',
               title: 'Features',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/features.html',
                   controller: 'FeaturesCtrl as ctrl',
                   resolve: {
                     resource: function (Restangular) {
                       return Restangular.one('/api/features').get();
                     }
                   }
                 }
               }
             })
      .state('site.form', {
               url: '/form',
               title: 'Form'
             })
      .state('site.dispatch', {
               url: '/dispatch',
               title: 'Dispatch',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/dispatch.html'
                 }
               }
             })
      .state('rootfolder-default', {
               parent: 'site',
               viewConfig: {
                 name: 'default',
                 resourceType: 'RootFolder'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/rootfolder-default.html'
                 }
               }
             })
      .state('folder-default', {
               parent: 'site',
               viewConfig: {
                 name: 'default',
                 resourceType: 'Folder'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/folder-default.html'
                 }
               }
             })
      .state('folder-edit', {
               parent: 'site',
               viewConfig: {
                 name: 'edit',
                 resourceType: 'Folder'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/folder-edit.html'
                 }
               }
             })
      .state('invoicesfolder-default', {
               parent: 'site',
               viewConfig: {
                 name: 'default',
                 resourceType: 'Folder',
                 marker: 'invoices'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/invoicesfolder-default.html'
                 }
               }
             })
      .state('security', {
               parent: 'site'
             })
      .state('security.overview', {
               url: '/overview',
               title: 'Overview',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/security.overview.html'
                 }
               }
             })
      .state('security.none', {
               url: '/none',
               title: 'No Security',
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
               views: {
                 'md-content@root': {
                   template: '<h1>Frontend Security</h1>'
                 }
               }
             })
      .state('security.backend', {
               url: '/backend',
               title: 'Backend Marker',
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
               views: {
                 'md-content@root': {
                   template: '<h1>Forbidden Resource</h1>'
                 }
               }
             })

      .state('security.error', {
               url: '/error',
               title: 'Error',
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
