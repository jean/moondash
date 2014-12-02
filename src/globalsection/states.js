function ModuleInit($stateProvider) {
  $stateProvider
    .state('root.dashboard', {
             url: '/dashboard',
             section: {
               group: 'root',
               label: 'Dashboard',
               priority: 1
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.dashboard.all', {
             url: '/all',
             subsection: {
               section: 'root.dashboard',
               label: 'All',
               priority: 0
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.dashboard.some', {
             url: '/some',
             subsection: {
               section: 'root.dashboard',
               group: 'dashboard',
               label: 'Some'
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.settings', {
             url: '/settings',
             section: {
               group: 'root',
               label: 'Settings',
               priority: 2
             },
             views: {
               'md-content@root': {
                 template: '<h2>Settings</h2>'
               }
             }
           })
    .state('root.types', {
             url: '/types',
             views: {
               'md-content@root': {
                 template: '<h2>Types</h2>'
               }
             }
           })
    .state('root.types.users', {
             url: '/users',
             views: {
               'md-content@root': {
                 template: '<h2>Users</h2>'
               }
             }
           })
    .state('root.types.invoices', {
             url: '/invoices',
             views: {
               'md-content@root': {
                 template: '<h2>Invoices</h2>'
               }
             }
           });
}


angular.module('moondash')
  .config(ModuleInit);