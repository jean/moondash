(function () {

  function StateController(invoices, $state) {
    var ctrl = this;
    ctrl.invoices = invoices;
    ctrl.model = {};
    ctrl.create = function () {
      invoices.post(ctrl.model)
        .then(
        function () {
          $state.go('e2e.collectionList');
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('e2e.collectionAdd', {
               url: '/collectionAdd',
               templateUrl: 'templates/collection_add.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 invoices: function (baseResourceTypes) {
                   return baseResourceTypes.all('invoices');
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
