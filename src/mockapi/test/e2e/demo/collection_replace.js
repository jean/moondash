(function () {

  function StateController(invoices, $state) {
    var ctrl = this;
    ctrl.invoices = invoices;
    ctrl.replace = function () {
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
                 invoices: function (invoicesOne) {
                   return invoicesOne.get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
