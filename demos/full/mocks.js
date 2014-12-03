function ModuleConfig(moondashMockRestProvider) {

  // TODO move this around later
  var peopleData = {
    resource: {
      id: 99, title: 'People'
    },
    items: [
      {'id': 1, 'title': 'Ada Lovelace'},
      {'id': 2, 'title': 'Grace Hopper'}
    ]
  };

  moondashMockRestProvider.addMocks(
    'people',
    [
      {
        pattern: /api\/people$/, responseData: peopleData, authenticate: true
      }
    ]);
}

angular.module('moondash')
  .config(ModuleConfig);