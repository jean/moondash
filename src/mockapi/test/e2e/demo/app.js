function RootController() {
}

function ModuleConfig($stateProvider, MdMockRestProvider) {

  // Register some mock data at /api/resources/invoices
  var newResourceTypes = {
    invoices: {
      i1: {id: 'i1', title: '1'},
      i2: {id: 'i2', title: '2'}
    }
  };

  var
    invoices = {
      id: 'invoices',
      title: 'Invoices',
      items: {
        i1: {id: 'i1', title: '1'},
        i2: {id: 'i2', title: '2'}
      }
    },
    MockResourceTypes = MdMockRestProvider.MockResourceTypes,
    invoicesMock = new MockResourceTypes('/api/resourcetypes', newResourceTypes);

  MdMockRestProvider.addMocks(invoicesMock.listMocks());

  // Top-level page
  $stateProvider
    .state('api', {
             url: '/api',
             templateUrl: 'templates/root.html',
             controller: RootController,
             controllerAs: 'ctrl',
             resolve: {
               baseApi: function (Restangular) {
                 return Restangular.all('api');
               }
             }
           })
}

angular.module('app', ['moondash', 'ui.router'])
  .config(ModuleConfig);