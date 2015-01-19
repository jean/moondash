(function () {

  function StateController(invoices, $state) {
    var ctrl = this;
    ctrl.invoices = invoices;
    ctrl.update = function () {
      // Only send the title as PATCH
      var jsonBody = {title: ctrl.invoices.title};
      invoices.patch(jsonBody)
        .then(
        function () {
          $state.go('collection.read');
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('collection.update', {
               url: '/update',
               templateUrl: 'templates/collection_update.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoices: function (baseInvoices) {
                   return baseInvoices.get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
