function ModuleConfig($stateProvider) {
  $stateProvider
    .state('rtypes', {
             parent: 'root'
           })

    // Generic list of resources of a resource type
    .state('rtypes.list', {
             url: '/{rtype}',
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
           })
}

function ModuleRun(MdConfig) {
  console.debug('foo')
  MdConfig.navMenus.rtypes = {
    label: 'Resource Types', priority: 2, items: [
      {label: 'Manage', state: 'rtypes.manage', priority: 99}
    ]
  };
}

angular.module('md.resourcetypes')
  .config(ModuleConfig)
  .run(ModuleRun);
