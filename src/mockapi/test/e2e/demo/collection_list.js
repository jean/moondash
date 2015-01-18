(function () {

  function StateController(invoices) {
    this.invoices = invoices;
    this.count = invoices.length;
  }

  function ModuleConfig($stateProvider) {
    // Make a root state that retrieves all the URLs and displays them
    $stateProvider
      .state('e2e.collectionList', {
               url: '/collectionList',
               templateUrl: 'templates/collection_list.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoices: function (baseInvoices) {
                   return baseInvoices.all('items').getList();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
