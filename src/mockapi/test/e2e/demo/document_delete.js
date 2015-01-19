(function () {

  function StateController(invoice, $state) {
    var ctrl = this;
    ctrl.invoice = invoice;
    ctrl.remove = function () {
      ctrl.invoice.remove()
        .then(
        function () {
          $state.go('collection.list');
        }
      )
    }
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
