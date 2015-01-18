(function () {

  function StateController(invoices) {
    this.invoices = invoices;
    this.prefix = invoices.prefix;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('e2e.collectionAdd', {
               url: '/collectionAdd',
               templateUrl: 'templates/collection_add.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoices: function (baseResourceTypes) {
                   return baseResourceTypes.one('invoices').get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
