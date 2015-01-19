(function () {

  function StateController(invoice, $state) {
    var ctrl = this;
    ctrl.invoice = invoice;
    ctrl.replace = function () {
      invoice.put(ctrl.invoice)
        .then(
        function () {
          $state.go('document.read', {id: ctrl.invoice.id});
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('document.replace', {
               url: '/replace',
               templateUrl: 'templates/document_replace.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
