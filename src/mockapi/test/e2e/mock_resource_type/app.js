function RootController(collectionREAD, collectionLIST) {
  this.responses = {
    collectionREAD: collectionREAD.data,
    collectionLIST: collectionLIST.data
  };
}

function ModuleConfig($stateProvider, MdMockRestProvider) {

  // Register some mock data at /api/resources/invoices
  var
    invoices = {
      invoice1: {id: "i1", title: '1'},
      invoice2: {id: "i2", title: '2'}
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
               collectionREAD: function ($http) {
                 return $http.get('/api/resourcetypes/invoices');
               },
               collectionLIST: function ($http) {
                 return $http.get('/api/resourcetypes/invoices/items');
               }
             }
           })
}

angular.module('app', ['moondash', 'ui.router'])
  .config(ModuleConfig);