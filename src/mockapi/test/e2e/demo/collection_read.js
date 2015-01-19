(function () {

  function StateController(invoices) {
    this.invoices = invoices;
  }

  function ModuleConfig($stateProvider) {
    // Make a base state
    $stateProvider
      .state('collection', {
               parent: 'demotypes',
               url: '/{typeId}',
               template: '<div ui-view></div>',
               resolve: {
                 invoicesOne: function ($stateParams, resourceTypesAll) {
                   return resourceTypesAll.one($stateParams.typeId);
                 },
                 invoicesAll: function ($stateParams, resourceTypesAll) {
                   return resourceTypesAll.all($stateParams.typeId);
                 }
               }
             })
    $stateProvider
      .state('collection.read', {
               url: '/read',
               templateUrl: 'templates/collection_read.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoices: function (invoicesOne) {
                   return invoicesOne.get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
