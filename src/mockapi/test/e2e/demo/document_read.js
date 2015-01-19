(function () {

  function StateController(invoice) {
    this.invoice = invoice;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('document', {
               url: '/{id}',
               parent: 'collection',
               templateUrl: 'templates/document_read.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoice: function ($stateParams, invoicesAll) {
                   var id = $stateParams.id;
                   return invoicesAll.one(id).get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
