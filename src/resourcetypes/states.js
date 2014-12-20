function ModuleConfig($stateProvider) {
  $stateProvider
    .state('rtypes', {
             parent: 'root',
             url: '/rtypes'
           })

    // Generic list of resources of a resource type
    .state('rtypes.list', {
             url: '/{rtype}', // Will need regex that omits "manage"
             title: 'List Resources',
             views: {
               'md-content@root': {
                 templateUrl: '/resourcetypes/templates/list.html',
                 controller: 'ListCtrl as ctrl'
               }
             }
           })
    .state('rtypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 templateUrl: '/resourcetypes/templates/manage.html',
                 controller: 'ManageCtrl as ctrl'
               }
             }
           });
}

function ModuleRun(MdConfig) {
  MdConfig.navMenus.rtypes = {
    label: 'Resource Types', priority: 2, items: [
      {label: 'Invoices', state: 'rtypes.list', params: 'rtype: "invoice"'},
      {label: 'Expenses', state: 'rtypes.list', params: 'rtype: "expense"'},
      {label: 'Payments', state: 'rtypes.list', params: 'rtype: "payment"'},
      {label: 'Manage', state: 'rtypes.manage', priority: 99}
    ]
  };
}

angular.module('md.resourcetypes')
  .config(ModuleConfig)
  .run(ModuleRun);
