(function () {

  function StateController(invoice) {
    this.invoice = invoice;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('document', {
               url: '/{id}',
               parent: 'collection',
               template: '<div ui-view></div>',
               resolve: {
                 invoice: function ($stateParams, invoicesAll) {
                   var id = $stateParams.id;
                   return invoicesAll.one(id).get();
                 }
               }
             })
      .state('document.read', {
               url: '/read',
               templateUrl: 'templates/document_read.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
