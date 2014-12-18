function ModuleConfig($stateProvider) {
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
           });
}


angular.module('moondash')
  .config(ModuleConfig);