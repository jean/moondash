function RootController() {
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

  // Top-level page
  $stateProvider
    .state("e2e", {
             url: '/e2e',
             templateUrl: 'templates/root.html',
             controller: RootController,
             controllerAs: 'ctrl',
             resolve: {
               baseResourceTypes: function (Restangular) {
                 return Restangular.all('api/resourcetypes');
               }
             }
           })
}

angular.module('app', ['moondash', 'ui.router'])
  .config(ModuleConfig);