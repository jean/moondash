(function () {
  function ModuleConfig(moondashMockRestProvider) {

    // TODO move this around later
    var features = {
      resource: {
        id: 99, title: 'Features'
      },
      items: [
        'Split into better file structure (module.js, states.js, etc.)',
        'This feature list is done with a mock API calls'
      ]
    };

    moondashMockRestProvider.addMocks(
      'features',
      [
        {
          pattern: /api\/features$/,
          responseData: features
        }
      ]);
  }

  angular.module('full')
    .config(ModuleConfig);

})();
