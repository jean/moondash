(function () {

  function StateController(resourceTypes) {
    this.resourceTypes = resourceTypes;
  }

  function ModuleConfig($stateProvider) {
    // Make a base state
    $stateProvider
      .state('demotypes', {
               parent: 'api',
               url: '/demotypes',
               template: '<div ui-view></div>',
               resolve: {
                 resourceTypesOne: function (baseApi) {
                   return baseApi.one('resourcetypes');
                 },
                 resourceTypesAll: function (baseApi) {
                   return baseApi.all('resourcetypes');
                 }
               }
             })
    $stateProvider
      .state('demotypes.read', {
               url: '/read',
               templateUrl: 'templates/resourcetypes_read.html',
               controller: StateController,
               controllerAs: 'ctrl',
               resolve: {
                 resourceTypes: function (resourceTypesOne) {
                   return resourceTypesOne.get();
                 }
               }
             })
  }

  angular.module('app')
    .config(ModuleConfig);

})();
