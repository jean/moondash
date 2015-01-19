(function () {

  function StateController(invoice) {
    this.invoice = invoice;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('document.delete', {
               url: '/delete',
               templateUrl: 'templates/document_delete.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
