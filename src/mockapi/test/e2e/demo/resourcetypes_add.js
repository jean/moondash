(function () {

  function StateController(resourceTypesAll, $state) {
    var ctrl = this;
    ctrl.model = {};
    ctrl.create = function () {
      resourceTypesAll.post(ctrl.model)
        .then(
        function () {
          $state.go('demotypes.list');
        }
      );
    }
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('demotypes.add', {
               url: '/add',
               templateUrl: 'templates/resourcetypes_add.html',
               controller: StateController,
               controllerAs: 'ctrl'
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
