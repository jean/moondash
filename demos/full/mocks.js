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
        },
        {
          pattern: /api\/security\/backend/,
          authenticate: true,
          responseData: []
        }
      ]);

    var books = {
      schema: {
        type: "object",
        properties: {
          id: { type: "string", minLength: 2, title: "Identifier", description: "Internal id" },
          title: { type: "string", minLength: 2, title: "Book title" },
          author: { type: "string", minLength: 2, title: "Book author" }
        }
      },
      items: [
        {
          id: 'book1',
          title: 'The Big Money',
          author: 'John DosPassos'
        },
        {
          id: 'book2',
          title: 'Manhattan Transfert',
          author: 'John DosPassos'
        }
      ]
    };

    moondashMockRestProvider.addMocks(
      'books',
      [
      {
        pattern: /api\/books$/,
        responseData: books
      }
      ]);
  }

  angular.module('full')
    .config(ModuleConfig);

})();
