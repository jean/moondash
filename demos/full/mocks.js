(function () {
  function ModuleConfig(MdMockRestProvider) {

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

    MdMockRestProvider.addMocks(
      'features',
      [
        {
          pattern: /api\/features$/,
          responseData: features
        },
        {
          pattern: /api\/security\/backend/,
          authenticate: true,
          responseData: []
        }
      ]);
  }

  angular.module('full')
    .config(ModuleConfig);

})();
