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
                 controller: 'ListCtrl as ctrl',
                 resolve: {
                   items: function (Restangular, $stateParams, MdRTypes) {
                     var rtype = $stateParams.rtype;
                     var url = MdRTypes.urlPrefix + '/' + rtype + '/items';
                     return Restangular.all(url).getList();
                   }
                 }
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

angular.module('md.resourcetypes')
  .config(ModuleConfig);
