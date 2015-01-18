function StateController(invoices) {
  this.invoices = invoices;
  this.count = 27; //invoices.length;
  console.log('invoices', invoices);
}

function ModuleConfig($stateProvider) {
  // Make a root state that retrieves all the URLs and displays them
  $stateProvider
    .state('collectionList', {
             url: '/collectionList',
             parent: 'e2e',
             templateUrl: 'templates/collection_list.html',
             controller: StateController,
             controllerAs: 'ctrl',
             resolve: {
               invoices: function ($http) {
                 return $http.get('/api/resourcetypes/invoices/items');
               }
             }
           })
}

angular.module('app')
  .config(ModuleConfig);