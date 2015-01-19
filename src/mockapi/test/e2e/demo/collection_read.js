(function () {

  function StateController(invoices) {
    this.invoices = invoices;
    this.prefix = invoices.prefix;
  }

  function ModuleConfig($stateProvider) {
    // Make a base state
    $stateProvider
      .state('collection', {
               parent: 'e2e',
               template: '<div ui-view></div>',
               resolve: {
                 baseInvoices: function (baseResourceTypes) {
                   return baseResourceTypes.one('invoices');
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
                 invoices: function (baseInvoices) {
                   return baseInvoices.get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
