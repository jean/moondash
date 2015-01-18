(function () {

  function StateController(invoiceItems) {
    this.invoices = invoiceItems;
    this.count = invoiceItems.length;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('e2e.collectionList', {
               url: '/collectionList',
               templateUrl: 'templates/collection_list.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoiceItems: function (baseResourceTypes) {
                   return baseResourceTypes.all('invoices/items').getList();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
