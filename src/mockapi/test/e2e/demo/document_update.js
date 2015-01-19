(function () {

  function StateController(invoice, $state) {
    var ctrl = this;
    ctrl.invoice = invoice;
    ctrl.update = function () {
      // Only send the title as PATCH
      var jsonBody = {title: ctrl.invoice.title};
      invoice.patch(jsonBody)
        .then(
        function () {
          $state.go('document.read', {id: invoice.id});
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('document.update', {
               url: '/update',
               templateUrl: 'templates/document_update.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();