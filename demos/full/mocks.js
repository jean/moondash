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
      f1a = {
        path: '/api/root/folder1/foldera', id: 10, resourceType: 'Folder',
        title: 'Folder 1A', viewName: 'default', items: [],
        markers: ['invoices']
      },
      f1b = {
        path: '/api/root/folder1/folderB', id: 11, resourceType: 'Folder',
        title: 'Folder 1B', viewName: 'default', items: []
      },
      f1 = {
        path: '/api/root/folder1', id: 1, resourceType: 'Folder',
        title: 'Folder One', viewName: 'default',
        items: [f1a, f1b]
      },
      f2 = {
        path: '/api/root/folder2', id: 2, resourceType: 'Folder',
        title: 'Another Folder', viewName: 'default', items: []
      },
      rf = {
        path: '/api/root', id: 0, resourceType: 'RootFolder',
        title: 'Root Folder', viewName: 'default', items: [f1, f2]
      };

    // Assemble some parentage
    f1a.parents = [rf, f1];
    f1b.parents = [rf, f1];
    f1.parents = [rf];
    f2.parents = [rf];
    var sampleData = [f1, f2, rf, f1a, f1b];

    function resolvePath(request) {
      /* Given a path, return context, viewName, parents */

      var viewName = 'default',
        path = request.url;
      if (request.url.endsWith('/edit')) {
        viewName = 'edit';
        path = path.substring(0, path.length - (viewName.length + 1));
      }

      var context = _.find(sampleData, {path: path});
      if (!context) {
        return [404, 'Could not find ' + request.url];
      }
      var parents = context.parents;
      var responseData = {
        context: context,
        viewName: viewName,
        parents: parents
      };

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

    var invoices = [
      {id: "invoice1", title: 'First invoice'},
      {id: "invoice2", title: 'Second invoice'}
    ];
    MdMockRestProvider.addMocks(
      'rtypes',
      [
        {
          pattern: /api\/rtypes\/invoices\/items$/,
          responseData: invoices
        },
        {
          pattern: /api\/rtypes\/invoices\//,
          responder: function (request) {
            var id = request.url.split("/")[4];
            var invoice = _(invoices).first({id: id}).value()[0];
            return [200, invoice];
          }
        }
      ]);


    var user = {
      id: 'admin',
      email: 'admin@x.com',
      first_name: 'Admin',
      last_name: 'Lastie',
      twitter: 'admin'
    };

    MdMockRestProvider.addMocks(
      'auth',
      [
        {
          pattern: /api\/auth\/me/,
          responseData: user,
          authenticate: true
        },
        {
          method: 'POST',
          pattern: /api\/auth\/login/,
          responder: function (request) {
            var data = request.json_body;
            var un = data.username;
            var response;

            if (un === 'admin') {
              response = [204, {token: "mocktoken"}];
            } else {
              response = [401, {"message": "Invalid login or password"}];
            }

            return response;
          }
        }
      ]);

  }

  angular.module('full')
    .config(ModuleConfig);

})();
