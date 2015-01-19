(function () {

  function StateController(invoices, $state) {
    var ctrl = this;
    ctrl.invoices = invoices;
    ctrl.create = function () {
      invoices.save()
        .then(
        function () {
          $state.go('collection.read');
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('collection.replace', {
               url: '/replace',
               templateUrl: 'templates/collection_replace.html',
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
