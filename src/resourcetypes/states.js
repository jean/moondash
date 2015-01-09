'use strict';

var controllers = require('./controllers');

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('resourcetypes', {
             parent: 'root',
             url: '/resourcetypes'
           })

    // Generic list of resources of a resource type
    .state('resourcetypes.list', {
             url: '/{resourcetype}', // Will need regex that omits "manage"
             title: 'List Resources',
             views: {
               'md-content@root': {
                 template: require('./templates/list.html'),
                 controller: controllers.ListController,
                 controllerAs: 'ctrl',
                 resolve: {
                   items: function (Restangular, $stateParams, MdRTypes) {
                     var resourcetype = $stateParams.resourcetype;
                     var url = MdRTypes.urlPrefix + '/' + resourcetype + '/items';
                     return Restangular.all(url).getList();
                   }
                 }
               }
             }
           })
    .state('resourcetypes.item', {
             url: '/{resourcetype}/{id}',
             resolve: {
               item: function (Restangular, $stateParams, MdRTypes) {
                 var resourcetype = $stateParams.resourcetype;
                 var id = $stateParams.id;
                 var url = MdRTypes.urlPrefix + '/' + resourcetype + '/' + id;
                 return Restangular.one(url).get();
               }
             }
           })
    .state('resourcetypes.item.edit', {
             url: '/edit',
             title: 'Edit Resource',
             views: {
               'md-content@root': {
                 template: require('./templates/edit.html'),
                 controller: controllers.EditController,
                 controllerAs: 'ctrl'
               }
             }
           })
    .state('resourcetypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 template: require('./templates/manage.html'),
                 controller: controllers.ManageController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};
