(function () {
  function ModuleConfig(MdMockRestProvider) {

    /*   #####  Sample Data  ####  */
    var invoices = [
      {id: "invoice1", title: 'First invoice'},
      {id: "invoice2", title: 'Second invoice'}
    ];

    var features = {
      resource: {
        id: 99, title: 'Features'
      },
      items: [
        'Split into better file structure (module.js, states.js, etc.)',
        'This feature list is done with a mock API calls'
      ]
    };

    var user = {
      id: 'admin',
      email: 'admin@x.com',
      first_name: 'Admin',
      last_name: 'Lastie',
      twitter: 'admin'
    };

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

    /*   #####  End Sample Data  ####  */


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

    function InvoicesResponder(request) {
      var id = request.url.split("/")[4];
      var invoice = _(invoices).first({id: id}).value()[0];
      return [200, invoice];
    }

    function AuthMeResponder(request) {
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

    MdMockRestProvider.addMocks(
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
        },
        {
          pattern: /api\/resourcetypes\/invoices\/items$/,
          responseData: invoices
        },
        {
          pattern: /api\/resourcetypes\/invoices\//,
          responder: InvoicesResponder
        },
        {
          pattern: /api\/auth\/me/,
          responseData: user,
          authenticate: true
        },
        {
          method: 'POST',
          pattern: /api\/auth\/login/,
          responder: AuthMeResponder
        }
      ]);

  }

  angular.module('full')
    .config(ModuleConfig);

})();
