(function () {

  function StateController(invoices) {
    this.invoices = invoices;
  }

  function ModuleConfig($stateProvider) {
    // Make a base state
    $stateProvider
      .state('collection', {
               parent: 'demotypes',
               template: '<div ui-view></div>',
               resolve: {
                 invoicesOne: function (baseResourceTypes) {
                   return baseResourceTypes.one('invoices');
                 },
                 invoicesAll: function (baseResourceTypes) {
                   return baseResourceTypes.all('invoices');
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
