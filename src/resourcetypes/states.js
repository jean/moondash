'use strict';

var controllers = require('./controllers'),
  LocalRestangular = require('./services').LocalRestangular;

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('resourcetypes', {
             parent: 'root',
             url: '/resourcetypes',
             resolve: {
               baseResourceTypes: function (Restangular) {
                 return Restangular.all('api/resourcetypes');
               }
             }
           })

    // Custom action
    .state('resourcetypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 template: require('./templates/resourcetypes-manage.html'),
                 controller: controllers.ManageController,
                 controllerAs: 'ctrl',
                 resolve: {
                   resourceTypes: function (baseResourceTypes) {
                     return baseResourceTypes.all('items').getList();
                   }
                 }
               }
             }
           })

    // A resource type, e.g. /api/resourcetypes/invoices
    .state('resourcetype', {
             parent: 'resourcetypes',
             url: '/{resourcetype}',
             resolve: {
               baseResourceType: function ($stateParams, baseResourceTypes) {
                 var resourceType = $stateParams.resourcetype;
                 return baseResourceTypes.all(resourceType);
               }
             }
           })

    // LIST action of resources of a resource type
    .state('resourcetype.list', {
             url: '/list',
             title: 'List Resources',
             views: {
               'md-content@root': {
                 template: require('./templates/resourcetypes-list.html'),
                 controller: controllers.ListController,
                 controllerAs: 'ctrl',
                 resolve: {
                   items: function ($stateParams, baseResourceType) {
                     var id = $stateParams.id;
                     return baseResourceType.all('items').getList();
                   }
                 }
               }
             }
           })

    // READ a resource
    .state('resource', {
             url: '/{id}',
             parent: 'resourcetype',
             views: {
               'md-content@root': {
                 template: require('./templates/resource-read.html'),
                 controller: controllers.ResourceReadController,
                 controllerAs: 'ctrl'
               }
             },
             resolve: {
               resource: function ($stateParams, baseResourceType) {
                 var id = $stateParams.id;
                 return baseResourceType.one(id).get();
               }
             }
           })

    // The "replace" (PUT) action
    .state('resource.replace', {
             url: '/replace',
             title: 'Edit Resource',
             views: {
               'md-content@root': {
                 template: require('./templates/resource-replace.html'),
                 controller: controllers.ResourceEditController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};
