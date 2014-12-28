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
                 template: require('./templates/list.html'),
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
    .state('rtypes.item', {
             url: '/{rtype}/{id}',
             resolve: {
               item: function (Restangular, $stateParams, MdRTypes) {
                 var rtype = $stateParams.rtype;
                 var id = $stateParams.id;
                 var url = MdRTypes.urlPrefix + '/' + rtype + '/' + id;
                 return Restangular.one(url).get();
               }
             }
           })
    .state('rtypes.item.edit', {
             url: '/edit',
             title: 'Edit Resource',
             views: {
               'md-content@root': {
                 template: require('./templates/edit.html'),
                 controller: 'EditCtrl as ctrl'
               }
             }
           })
    .state('rtypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 template: require('./templates/manage.html'),
                 controller: 'ManageCtrl as ctrl'
               }
             }
           });
}

angular.module('md.resourcetypes')
  .config(ModuleConfig);
