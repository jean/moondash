(function () {
  function ModuleConfig($stateProvider, $urlRouterProvider) {
    //$urlRouterProvider.otherwise('/home');
    $stateProvider
      .state('site', {
               parent: 'root'
             })
      .state('site.home', {
               url: '/home',
               title: 'Home',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/home.html'
                 }
               }
             })
      .state('types.book', {
               url: '/book',
               title: 'Book',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/book.html'
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
      .state('site.collapse', {
               url: '/collapse',
               title: 'Collapse',
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/collapse.html',
                   controller: 'CollapseCtrl as ctrl'
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
      .state('invoicefolder-default', {
               parent: 'site',
               viewConfig: {
                 name: 'default',
                 resourceType: 'Folder',
                 marker: 'invoices'
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/invoicefolder-default.html'
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

  function ModuleRun(MdConfig) {
    var site, navMenus, config;
    site = {name: 'Full Demo'};
    navMenus = {
      demo: {
        label: 'Demo', priority: 3, items: [
          {label: 'Home', state: 'site.home'},
          {label: 'Dispatch', state: 'site.dispatch', priority: 1},
          {label: 'Features', state: 'site.features'},
          {label: 'Collapse', state: 'site.collapse'},
          {label: 'Form', state: 'site.form'},
          {
            label: 'Invoices', items: [
            {label: 'All', state: 'site.features', priority: 3},
            {label: 'Some', state: 'site.features', priority: 1},
            {label: 'One', state: 'site.features', priority: 2}
          ]
          }
        ]
      },
      security: {
        label: 'Security and Errors', priority: 4, items: [
          {label: 'No Security', state: 'security.none', priority: 6},
          {
            label: 'Frontend Marker',
            state: 'security.frontend',
            priority: 44
          },
          {
            label: 'Backend Marker',
            state: 'security.backend',
            priority: 99
          },
          {label: 'Forbidden', state: 'security.forbidden', priority: 3},
          {label: 'Error', state: 'security.error', priority: 1}
        ]
      }
    };
    config = {site: site, navMenus: navMenus};
    MdConfig.init(config);
    MdConfig.navMenus.root.items
      .push({
              label: 'Home',
              state: 'site.home'
            });
    MdConfig.navMenus.types.items
      .push({
              label: 'Books',
              state: 'types.book'
            });
  }

  angular.module('full')
    .config(ModuleConfig)
    .run(ModuleRun);

})();
