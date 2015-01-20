(function () {

  function StateController(resourceTypesItems) {
    this.resourceTypesItems = resourceTypesItems;
    this.count = this.resourceTypesItems.length;
  }

  function ModuleConfig($stateProvider) {
    $stateProvider
      .state('demotypes.list', {
               url: '/list',
               templateUrl: 'templates/resourcetypes_list.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 resourceTypesItems: function (resourceTypesAll) {
                   return resourceTypesAll.all('items').getList();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
