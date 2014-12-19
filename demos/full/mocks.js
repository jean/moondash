(function () {
  function ModuleConfig(MdMockRestProvider) {

    var features = {
      resource: {
        id: 99, title: 'Features'
      },
      items: [
        'Split into better file structure (module.js, states.js, etc.)',
        'This feature list is done with a mock API calls'
      ]
    };

    /*

    Folders
    ---------
    context
      - id, name, resourceType, markers, _self
      - items
    path
    viewName
    parents
     */

    var
      f1a = {path: '/root/folder1/foldera', id: 10, resourceType: 'Folder',
        title: 'Folder 1A', viewName: 'default', items: [],
        markers: ['invoices']},
      f1b = {path: '/root/folder1/folderB', id: 11, resourceType: 'Folder',
        title: 'Folder 1B', viewName: 'default', items: []},
      f1 = {path: '/root/folder1', id: 1, resourceType: 'Folder',
        title: 'Folder One', viewName: 'default',
        items: [f1a, f1b]},
      f2 = {path: '/root/folder2', id: 2, resourceType: 'Folder',
        title: 'Another Folder', viewName: 'default', items: []},
      rf = {path: '/root', id: 0, resourceType: 'RootFolder',
        title: 'Root Folder', viewName: 'default', items: [f1, f2]};

    // Assemble some parentage
    f1a.parents = [rf, f1];
    f1b.parents = [rf, f1];
    f1.parents = [rf];
    var sampleData = [f1, f2, rf, f1a, f1b];

    function resolvePath(method, url, data) {
      /* Given a path, return context, viewName, parents */

      var path = url.substring(4);

      var context = _.find(sampleData, {path: path});
      var viewName = context.viewName;
      var parents = context.parents;
      var responseData = {context: context, viewName: viewName, parents: parents};

      return [200, {data: responseData}];
    }

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
        },
        {
          pattern: /api\/root/,
          responder: resolvePath
        }
      ]);
  }

  angular.module('full')
    .config(ModuleConfig);

})();
