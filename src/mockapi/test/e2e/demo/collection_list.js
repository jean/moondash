(function () {

  function StateController(invoiceItems) {
    this.invoiceItems = invoiceItems;
    this.count = invoiceItems.length;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('collection.list', {
               url: '/list',
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
