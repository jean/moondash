function ModuleInit($stateProvider) {
  $stateProvider
    .state('root.dashboard', {
             url: '/dashboard',
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.settings', {
             url: '/settings',
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
             url: '/types',
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

function ModuleRun(MdSections) {
  MdSections.addSectionGroup(
    {
      id: 'root',
      label: false,
      sections: [
        {
          label: "Dashboard", state: "root.dashboard"
        },
        {
          label: "Settings", state: "root.settings"
        }
      ]
    }
  );
  MdSections.addSectionGroup(
    {
      id: 'types',
      label: "Types",
      sections: [
        {
          label: "Users", state: "root.types.users"
        },
        {
          label: "Invoices", state: "root.types.invoices"
        }
      ]
    }
  );
}

angular.module('moondash')
  .config(ModuleInit)
  .run(ModuleRun);