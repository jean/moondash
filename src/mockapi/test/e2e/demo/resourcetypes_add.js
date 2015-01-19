(function () {

  function StateController(invoicesAll, $state) {
    var ctrl = this;
    ctrl.model = {};
    ctrl.create = function () {
      invoicesAll.post(ctrl.model)
        .then(
        function () {
          $state.go('collection.list');
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('collection.add', {
               url: '/add',
               templateUrl: 'templates/collection_add.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
