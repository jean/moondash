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
                 invoice: function ($stateParams, invoicesOne) {
                   var id = $stateParams.id;
                   console.log('id232', id);
                   return invoicesOne.one(id).get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
