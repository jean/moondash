function RootController(collectionLIST) {
  this.responses = [
    {title: 'collectionLIST', value: JSON.stringify(collectionLIST)}
  ];
}

function ModuleConfig($stateProvider, MdMockRestProvider) {

  // Register some mock data at /api/resources/invoices
  var
    invoices = {
      invoice1: {id: "invoice1", title: 'First invoice'},
      invoice2: {id: "invoice2", title: 'Second invoice'}
    },
    MockResourceType = MdMockRestProvider.MockResourceType,
    invoicesMock = new MockResourceType('/api/resourcetypes', 'invoices', invoices);

  MdMockRestProvider.addMocks(invoicesMock.listMocks());

  // Make a root state that retrieves all the URLs and displays them
  $stateProvider
    .state("state1", {
             url: '/',
             templateUrl: 'root.html',
             controller: RootController,
             controllerAs: 'ctrl',
             resolve: {
               collectionLIST: function ($http) {
                 return $http.get('/api/resourcetypes/invoices/items');
               }
             }
           })
}

angular.module('app', ['moondash', 'ui.router'])
  .config(ModuleConfig);