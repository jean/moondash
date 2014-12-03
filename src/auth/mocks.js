function ModuleConfig(moondashMockRestProvider) {

  var user = {
    id: 'admin',
    email: 'admin@x.com',
    first_name: 'Admin',
    last_name: 'Lastie',
    twitter: 'admin'
  };

  moondashMockRestProvider.addMocks(
    'auth',
    [
      {
        pattern: /api\/auth\/me/, responseData: user
      },
      {
        method: 'POST',
        pattern: /api\/auth\/login/,
        responder: function (method, url, data) {
          data = angular.fromJson(data);
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

angular.module('moondash')
  .config(ModuleConfig);