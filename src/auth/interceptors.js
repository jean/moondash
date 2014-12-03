function AuthzResponseRedirect($q, $injector) {

  return {
    responseError: function (rejection) {
      var
        $state = $injector.get('$state'),
        $notice = $injector.get('$notice');

      // We can get an /api/ response of forbidden for
      // some data needed in a view. Flash a notice saying that this
      // data was requested.
      var url = rejection.config.url;
      if (rejection.status == 403 || rejection.status == 401) {
        // Redirect to the login form
        $state.go('siteroot.login');
        var msg = 'Login required for: ' + url;
        $notice(msg);
      }
      return $q.reject(rejection);
    }
  };

}

function ModuleConfig($httpProvider, $authProvider) {
  $httpProvider.interceptors.push('authzRedirect');

  var baseUrl = '';

  // Satellizer setup
  $authProvider.loginUrl = baseUrl + '/api/auth/login';
}

function ModuleRun($rootScope, $state, $auth, $notice) {
  // A state can be annotated with a value indicating
  // the state requires login.

  $rootScope.$on(
    "$stateChangeStart",
    function (event, toState, toParams, fromState) {
      if (toState.authenticate && !$auth.isAuthenticated()) {
        // User isn’t authenticated and this state wants auth
        var t = toState.title || toState.name;
        var msg = 'The page ' + t + ' requires a login';
        $notice.show(msg)
        $state.transitionTo("root.login");
        event.preventDefault();
      }
    });
}


angular.module('moondash')
  .factory('authzRedirect', AuthzResponseRedirect)
  .config(ModuleConfig)
  .run(ModuleRun);