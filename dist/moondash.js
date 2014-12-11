(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = ['ngSanitize', 'ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse', 'schemaForm'];

// If ngMock is loaded, it takes over the backend. We should only add
// it to the list of module dependencies if we are in "frontend mock"
// mode. Flag this by putting the class .frontendMock on some element
// in the demo .html page.
var mockApi = document.querySelector('.mockApi');
if (mockApi) {
  dependencies.push('ngMockE2E');
  dependencies.push('moondashMock');
}

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('moondash', dependencies);

// Now the Moondash components
require('./layout');
require('./globalsection');
require('./configurator');
require('./mockapi');
require('./auth');
require('./hellotesting');
require('./notice');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":3,"./configurator":8,"./globalsection":10,"./hellotesting":12,"./layout":15,"./mockapi":18,"./notice":21}],2:[function(require,module,exports){
function LoginCtrl($auth, $notice) {
  var _this = this;
  this.errorMessage = false;

  this.login = function ($valid, username, password) {
    $auth.login({username: username, password: password})
      .then(function () {
              _this.errorMessage = false;
              $notice.show('You have successfully logged in');
            })
      .catch(function (response) {
               _this.errorMessage = response.data.message;
             });
  }
}

function LogoutCtrl($auth, $notice) {
  $auth.logout()
    .then(function () {
            $notice.show('You have been logged out');
          });
}

function ProfileCtrl(profile) {
  this.profile = profile;
}

angular.module('moondash')
  .controller('LoginCtrl', LoginCtrl)
  .controller('LogoutCtrl', LogoutCtrl)
  .controller('ProfileCtrl', ProfileCtrl);

},{}],3:[function(require,module,exports){
'use strict';

require('./states');
require('./controllers');
require('./services');
require('./interceptors')
require('./mocks');

},{"./controllers":2,"./interceptors":4,"./mocks":5,"./services":6,"./states":7}],4:[function(require,module,exports){
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
        $state.go('auth.login');
        var msg = 'Login required for data at: ' + url;
        $notice.show(msg);
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
        $state.transitionTo("auth.login");
        event.preventDefault();
      }
    });
}


angular.module('moondash')
  .factory('authzRedirect', AuthzResponseRedirect)
  .config(ModuleConfig)
  .run(ModuleRun);
},{}],5:[function(require,module,exports){
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
        pattern: /api\/auth\/me/,
        responseData: user,
        authenticate: true
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
},{}],6:[function(require,module,exports){
function Profile(Restangular) {
  return {
    getProfile: function () {
      return Restangular.one('/api/auth/me').get();
    }
  };
}

angular.module("moondash")
  .factory('MdProfile', Profile);

},{}],7:[function(require,module,exports){
function ModuleConfig($stateProvider) {
  $stateProvider
    .state('auth', {
             url: '/auth',
             parent: 'root'
           })
    .state('auth.login', {
             url: '/login',
             views: {
               'md-content@root': {
                 templateUrl: '/auth/templates/login.html',
                 controller: 'LoginCtrl as ctrl'
               }
             }
           })
    .state('auth.logout', {
             url: '/logout',
             views: {
               'md-content@root': {
                 controller: 'LogoutCtrl as ctrl',
                 templateUrl: '/auth/templates/logout.html'
               }
             }
           })
    .state('auth.profile', {
             url: '/profile',
             //authenticate: true,
             views: {
               'md-content@root': {
                 templateUrl: '/auth/templates/profile.html',
                 controller: 'ProfileCtrl as ctrl'
               }
             },
             resolve: {
               profile: function (MdProfile) {
                 return MdProfile.getProfile();
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleConfig);
},{}],8:[function(require,module,exports){
'use strict';

require('./services');


},{"./services":9}],9:[function(require,module,exports){
'use strict';

function ModuleConfig(RestangularProvider) {
  RestangularProvider.setBaseUrl('/api');
}

function MdConfig() {
  this.siteName = 'Moondash';
}


angular.module("moondash")
  .config(ModuleConfig)
  .service('MdConfig', MdConfig);

},{}],10:[function(require,module,exports){
'use strict';

require('./states');

},{"./states":11}],11:[function(require,module,exports){
function ModuleConfig($stateProvider) {
  $stateProvider
    .state('root.dashboard', {
             url: '/dashboard',
             section: {
               group: 'root',
               label: 'Dashboard',
               priority: 1
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.dashboard.all', {
             url: '/all',
             subsection: {
               section: 'root.dashboard',
               label: 'All',
               priority: 0
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.dashboard.some', {
             url: '/some',
             subsection: {
               section: 'root.dashboard',
               group: 'dashboard',
               label: 'Some'
             },
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.settings', {
             url: '/settings',
             section: {
               group: 'root',
               label: 'Settings',
               priority: 2
             },
             views: {
               'md-content@root': {
                 template: '<h2>Settings</h2>'
               }
             }
           })
    .state('root.types', {
             url: '/types',
             views: {
               'md-content@root': {
                 template: '<h2>Types</h2>'
               }
             }
           })
    .state('root.types.users', {
             url: '/users',
             views: {
               'md-content@root': {
                 template: '<h2>Users</h2>'
               }
             }
           })
    .state('root.types.invoices', {
             url: '/invoices',
             views: {
               'md-content@root': {
                 template: '<h2>Invoices</h2>'
               }
             }
           });
}


angular.module('moondash')
  .config(ModuleConfig);
},{}],12:[function(require,module,exports){
'use strict';

module.exports = 'Hello world!'

},{}],13:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderCtrl($state, MdConfig, $auth) {
  this.$auth = $auth;
  this.siteName = MdConfig.siteName;
}

function SectionsCtrl(MdSections, $state) {
  this.sectionGroups = MdSections.getSectionGroups($state);

  this.subsections = [1,2,3];
}

angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],14:[function(require,module,exports){
function NestedSectionCtrl($scope){
  this.isCollapsed = true;
  this.section = $scope.ngModel;
}


function NestedSection() {
  return {
    restrict: "E",
    templateUrl: "/layout/templates/nested-section.html",
    require: '^ngModel',
    scope: {
      ngModel: '=ngModel'
    },
    controller: NestedSectionCtrl,
    controllerAs: 'ctrl'
  }
}

angular.module("moondash")
  .directive("mdNestedSection", NestedSection);
},{}],15:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');
require('./services');
require('./directives');
},{"./controllers":13,"./directives":14,"./services":16,"./states":17}],16:[function(require,module,exports){
function MdLayoutService($rootScope, MdConfig) {
  var _this = this;
  this.pageTitle = MdConfig.siteName;

  // Whenever the state changes, update the pageTitle
  function changeTitle(evt, toState) {
    if (toState.title) {
      // Sure would like to automatically put in resource.title but
      // unfortunately ui-router doesn't give me access to the resolve
      // from this event.
      _this.pageTitle = MdConfig.siteName + ' - ' + toState.title;
    } else {
      // Reset to default
      _this.pageTitle = MdConfig.siteName;
    }
  }

  $rootScope.$on('$stateChangeSuccess', changeTitle);
}

function MdSectionsService() {
  this.addSection = function (groupId, section) {
    // Allow sitedev app to extend the root section group
  };

  this.getSectionGroups = function ($state) {
    var sectionGroups = {},
      sections = {};

    // First get all the section groups
    var allStates = $state.get();
    _(allStates)
      .filter('sectionGroup')
      .forEach(
      function (state) {
        var sg = _(state.sectionGroup)
          .pick(['label', 'priority']).value();
        // If no label, try a title on the state
        if (!sg.label) sg.label = state.title;
        sg.state = state.name;
        sectionGroups[sg.state] = sg;
      });

    // Now get the sections
    _(allStates).filter('section')
      .forEach(
      function (state) {
        var section = state.section;
        var s = _(section).pick(['group', 'label', 'priority'])
          .value();
        // If no label, try a title on the state
        if (!s.label) s.label = state.title;
        s.state = state.name;
        sections[s.state] = s;
      });

    // And any subsections
    _(allStates).filter('subsection')
      .forEach(
      function (state) {
        var subsection = state.subsection;
        var section = sections[subsection.section];

        // If this section doesn't yet have an subsections, make one
        if (!section.subsections) {
          section.subsections = [];
        }

        // Add this subsection
        var ss = _(subsection).pick(['priority', 'label'])
          .value();
        // If no label, try a title on the state
        if (!ss.label) ss.label = state.title;
        ss.state = state.name;
        section.subsections.push(ss);
      });

    // Now re-assemble with sorting
    return _(sectionGroups)
      .map(
      function (sg) {
        // Get all the sections for this section group
        sg.sections = _(sections)
          .filter({group: sg.state})
          .map(
          function (s) {
            if (s.subsections) {
              var newSubsections = _(s.subsections)
                .sortBy('priority')
                .value();
              s.subsections = newSubsections;
            }
            return s;
          })
          .sortBy('priority')
          .value();
        return sg;
      })
      .sortBy('priority')
      .value();
  }
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .service('MdSections', MdSectionsService)
  .run(ModuleRun);

},{}],17:[function(require,module,exports){
function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/templates/md-layout.html',
             controller: "LayoutCtrl"
           })
    .state('root', {
             parent: 'layout',
             sectionGroup: {
               label: false,
               priority: 0
             },
             views: {
               'md-header': {
                 templateUrl: '/layout/templates/md-header.html',
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-sectionsmenu': {
                 templateUrl: '/layout/templates/md-sectionsmenu.html',
                 controller: 'SectionsCtrl as ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 templateUrl: '/layout/templates/md-footer.html'
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleConfig);
},{}],18:[function(require,module,exports){
'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

require('./providers');

// TODO Not sure if there is a way, now that we are using CommonJS, to
// eliminate this little IIFE.

(function (mod) {
  'use strict';

  mod.run(function ($httpBackend, moondashMockRest) {

    moondashMockRest.registerMocks($httpBackend);

    // pass through everything else
    $httpBackend.whenGET(/\/*/).passThrough();
    $httpBackend.whenPOST(/\/*/).passThrough();
    $httpBackend.whenPUT(/\/*/).passThrough();

  });

}(angular.module('moondashMock', ['moondash', 'ngMockE2E'])));
},{"./providers":19}],19:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function MoondashMocks() {
  this.mocks = {};

  this.$get = function () {
    var mocks = this.mocks;
    return {
      registerMocks: function ($httpBackend) {
        // Iterate over all the registered mocks and register them
        _.map(mocks, function (moduleMocks) {
          _(moduleMocks).forEach(function (mock) {
            // Get the data from the mock
            var method = mock.method || 'GET',
              pattern = mock.pattern,
              responder = mock.responder,
              responseData = mock.responseData;

            var wrappedResponder = function (method, url, data, headers) {

              // If the mock says to authenticate and we don't have
              // an Authorization header, return 401.
              if (mock.authenticate) {
                var authz = headers['Authorization'];
                if (!authz) {
                  return [401, {"message": "Login required"}];
                }
              }

              // A generic responder for handling the case where the
              // mock just wanted the basics and supplied responseData
              if (!responder) {
                return [200, responseData]
              }

              // Got here, so let's go ahead and call the
              // registered responder
              return responder(method, url, data, headers)
            };

            $httpBackend.when(method, pattern)
              .respond(wrappedResponder);
          });
        });
      }
    };
  };

  this.addMocks = function (k, v) {
    this.mocks[k] = v;
  };
}


angular.module("moondash")
  .provider('moondashMockRest', MoondashMocks);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
function NoticeCtrl($scope, $modalInstance, $timeout, message) {
  this.message = message;
  var seconds = 3;
  var timer = $timeout(
    function () {
      $modalInstance.dismiss();
    }, seconds * 1000
  );
  $scope.$on(
    'destroy',
    function () {
      $timeout.cancel(timer);
    })
}

angular.module('moondash')
  .controller('NoticeCtrl', NoticeCtrl);
},{}],21:[function(require,module,exports){
require('./controllers');
require('./services');
},{"./controllers":20,"./services":22}],22:[function(require,module,exports){
function NoticeService($modal) {
  this.show = function (message) {
    var modalInstance = $modal.open(
      {
        templateUrl: 'noticeModal.html',
        controller: 'NoticeCtrl as ctrl',
        size: 'sm',
        resolve: {
          message: function () {
            return message;
          }
        }
      });

    modalInstance.result.then(function () {

    });

  }
}

angular.module('moondash')
  .service('$notice', NoticeService);
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2F1dGgvY29udHJvbGxlcnMuanMiLCJzcmMvYXV0aC9pbmRleC5qcyIsInNyYy9hdXRoL2ludGVyY2VwdG9ycy5qcyIsInNyYy9hdXRoL21vY2tzLmpzIiwic3JjL2F1dGgvc2VydmljZXMuanMiLCJzcmMvYXV0aC9zdGF0ZXMuanMiLCJzcmMvY29uZmlndXJhdG9yL2luZGV4LmpzIiwic3JjL2NvbmZpZ3VyYXRvci9zZXJ2aWNlcy5qcyIsInNyYy9nbG9iYWxzZWN0aW9uL2luZGV4LmpzIiwic3JjL2dsb2JhbHNlY3Rpb24vc3RhdGVzLmpzIiwic3JjL2hlbGxvdGVzdGluZy9pbmRleC5qcyIsInNyYy9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvbGF5b3V0L2RpcmVjdGl2ZXMuanMiLCJzcmMvbGF5b3V0L2luZGV4LmpzIiwic3JjL2xheW91dC9zZXJ2aWNlcy5qcyIsInNyYy9sYXlvdXQvc3RhdGVzLmpzIiwic3JjL21vY2thcGkvaW5kZXguanMiLCJzcmMvbW9ja2FwaS9wcm92aWRlcnMuanMiLCJzcmMvbm90aWNlL2NvbnRyb2xsZXJzLmpzIiwic3JjL25vdGljZS9pbmRleC5qcyIsInNyYy9ub3RpY2Uvc2VydmljZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbid1c2Ugc3RyaWN0JztcblxuLypcblxuIERlY2xhcmUgdGhlIG1vZHVsZSB3aXRoIGRlcGVuZGVuY2llcywgYW5kIG5vdGhpbmcgbW9yZS5cblxuIElmIHJ1bm5pbmcgaW4gXCJkZXZlbG9wbWVudCBtb2RlXCIsIGluamVjdCB0aGUgbW9jayBpbmZyYXN0cnVjdHVyZS5cblxuICovXG5cbnZhciBkZXBlbmRlbmNpZXMgPSBbJ25nU2FuaXRpemUnLCAndWkucm91dGVyJywgJ3Jlc3Rhbmd1bGFyJywgJ3NhdGVsbGl6ZXInLFxuICAndWkuYm9vdHN0cmFwLm1vZGFsJywgJ3VpLmJvb3RzdHJhcC5jb2xsYXBzZScsICdzY2hlbWFGb3JtJ107XG5cbi8vIElmIG5nTW9jayBpcyBsb2FkZWQsIGl0IHRha2VzIG92ZXIgdGhlIGJhY2tlbmQuIFdlIHNob3VsZCBvbmx5IGFkZFxuLy8gaXQgdG8gdGhlIGxpc3Qgb2YgbW9kdWxlIGRlcGVuZGVuY2llcyBpZiB3ZSBhcmUgaW4gXCJmcm9udGVuZCBtb2NrXCJcbi8vIG1vZGUuIEZsYWcgdGhpcyBieSBwdXR0aW5nIHRoZSBjbGFzcyAuZnJvbnRlbmRNb2NrIG9uIHNvbWUgZWxlbWVudFxuLy8gaW4gdGhlIGRlbW8gLmh0bWwgcGFnZS5cbnZhciBtb2NrQXBpID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vY2tBcGknKTtcbmlmIChtb2NrQXBpKSB7XG4gIGRlcGVuZGVuY2llcy5wdXNoKCduZ01vY2tFMkUnKTtcbiAgZGVwZW5kZW5jaWVzLnB1c2goJ21vb25kYXNoTW9jaycpO1xufVxuXG52YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcsIGRlcGVuZGVuY2llcyk7XG5cbi8vIE5vdyB0aGUgTW9vbmRhc2ggY29tcG9uZW50c1xucmVxdWlyZSgnLi9sYXlvdXQnKTtcbnJlcXVpcmUoJy4vZ2xvYmFsc2VjdGlvbicpO1xucmVxdWlyZSgnLi9jb25maWd1cmF0b3InKTtcbnJlcXVpcmUoJy4vbW9ja2FwaScpO1xucmVxdWlyZSgnLi9hdXRoJyk7XG5yZXF1aXJlKCcuL2hlbGxvdGVzdGluZycpO1xucmVxdWlyZSgnLi9ub3RpY2UnKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiZnVuY3Rpb24gTG9naW5DdHJsKCRhdXRoLCAkbm90aWNlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuZXJyb3JNZXNzYWdlID0gZmFsc2U7XG5cbiAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uICgkdmFsaWQsIHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICRhdXRoLmxvZ2luKHt1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLmVycm9yTWVzc2FnZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAkbm90aWNlLnNob3coJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBsb2dnZWQgaW4nKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICBfdGhpcy5lcnJvck1lc3NhZ2UgPSByZXNwb25zZS5kYXRhLm1lc3NhZ2U7XG4gICAgICAgICAgICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTG9nb3V0Q3RybCgkYXV0aCwgJG5vdGljZSkge1xuICAkYXV0aC5sb2dvdXQoKVxuICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRub3RpY2Uuc2hvdygnWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0Jyk7XG4gICAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIFByb2ZpbGVDdHJsKHByb2ZpbGUpIHtcbiAgdGhpcy5wcm9maWxlID0gcHJvZmlsZTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybClcbiAgLmNvbnRyb2xsZXIoJ0xvZ291dEN0cmwnLCBMb2dvdXRDdHJsKVxuICAuY29udHJvbGxlcignUHJvZmlsZUN0cmwnLCBQcm9maWxlQ3RybCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5yZXF1aXJlKCcuL2ludGVyY2VwdG9ycycpXG5yZXF1aXJlKCcuL21vY2tzJyk7XG4iLCJmdW5jdGlvbiBBdXRoelJlc3BvbnNlUmVkaXJlY3QoJHEsICRpbmplY3Rvcikge1xuXG4gIHJldHVybiB7XG4gICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlamVjdGlvbikge1xuICAgICAgdmFyXG4gICAgICAgICRzdGF0ZSA9ICRpbmplY3Rvci5nZXQoJyRzdGF0ZScpLFxuICAgICAgICAkbm90aWNlID0gJGluamVjdG9yLmdldCgnJG5vdGljZScpO1xuXG4gICAgICAvLyBXZSBjYW4gZ2V0IGFuIC9hcGkvIHJlc3BvbnNlIG9mIGZvcmJpZGRlbiBmb3JcbiAgICAgIC8vIHNvbWUgZGF0YSBuZWVkZWQgaW4gYSB2aWV3LiBGbGFzaCBhIG5vdGljZSBzYXlpbmcgdGhhdCB0aGlzXG4gICAgICAvLyBkYXRhIHdhcyByZXF1ZXN0ZWQuXG4gICAgICB2YXIgdXJsID0gcmVqZWN0aW9uLmNvbmZpZy51cmw7XG4gICAgICBpZiAocmVqZWN0aW9uLnN0YXR1cyA9PSA0MDMgfHwgcmVqZWN0aW9uLnN0YXR1cyA9PSA0MDEpIHtcbiAgICAgICAgLy8gUmVkaXJlY3QgdG8gdGhlIGxvZ2luIGZvcm1cbiAgICAgICAgJHN0YXRlLmdvKCdhdXRoLmxvZ2luJyk7XG4gICAgICAgIHZhciBtc2cgPSAnTG9naW4gcmVxdWlyZWQgZm9yIGRhdGEgYXQ6ICcgKyB1cmw7XG4gICAgICAgICRub3RpY2Uuc2hvdyhtc2cpO1xuICAgICAgfVxuICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRodHRwUHJvdmlkZXIsICRhdXRoUHJvdmlkZXIpIHtcbiAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgnYXV0aHpSZWRpcmVjdCcpO1xuXG4gIHZhciBiYXNlVXJsID0gJyc7XG5cbiAgLy8gU2F0ZWxsaXplciBzZXR1cFxuICAkYXV0aFByb3ZpZGVyLmxvZ2luVXJsID0gYmFzZVVybCArICcvYXBpL2F1dGgvbG9naW4nO1xufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oJHJvb3RTY29wZSwgJHN0YXRlLCAkYXV0aCwgJG5vdGljZSkge1xuICAvLyBBIHN0YXRlIGNhbiBiZSBhbm5vdGF0ZWQgd2l0aCBhIHZhbHVlIGluZGljYXRpbmdcbiAgLy8gdGhlIHN0YXRlIHJlcXVpcmVzIGxvZ2luLlxuXG4gICRyb290U2NvcGUuJG9uKFxuICAgIFwiJHN0YXRlQ2hhbmdlU3RhcnRcIixcbiAgICBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUpIHtcbiAgICAgIGlmICh0b1N0YXRlLmF1dGhlbnRpY2F0ZSAmJiAhJGF1dGguaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgLy8gVXNlciBpc27igJl0IGF1dGhlbnRpY2F0ZWQgYW5kIHRoaXMgc3RhdGUgd2FudHMgYXV0aFxuICAgICAgICB2YXIgdCA9IHRvU3RhdGUudGl0bGUgfHwgdG9TdGF0ZS5uYW1lO1xuICAgICAgICB2YXIgbXNnID0gJ1RoZSBwYWdlICcgKyB0ICsgJyByZXF1aXJlcyBhIGxvZ2luJztcbiAgICAgICAgJG5vdGljZS5zaG93KG1zZylcbiAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbyhcImF1dGgubG9naW5cIik7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG59XG5cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmZhY3RvcnkoJ2F1dGh6UmVkaXJlY3QnLCBBdXRoelJlc3BvbnNlUmVkaXJlY3QpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKVxuICAucnVuKE1vZHVsZVJ1bik7IiwiZnVuY3Rpb24gTW9kdWxlQ29uZmlnKG1vb25kYXNoTW9ja1Jlc3RQcm92aWRlcikge1xuXG4gIHZhciB1c2VyID0ge1xuICAgIGlkOiAnYWRtaW4nLFxuICAgIGVtYWlsOiAnYWRtaW5AeC5jb20nLFxuICAgIGZpcnN0X25hbWU6ICdBZG1pbicsXG4gICAgbGFzdF9uYW1lOiAnTGFzdGllJyxcbiAgICB0d2l0dGVyOiAnYWRtaW4nXG4gIH07XG5cbiAgbW9vbmRhc2hNb2NrUmVzdFByb3ZpZGVyLmFkZE1vY2tzKFxuICAgICdhdXRoJyxcbiAgICBbXG4gICAgICB7XG4gICAgICAgIHBhdHRlcm46IC9hcGlcXC9hdXRoXFwvbWUvLFxuICAgICAgICByZXNwb25zZURhdGE6IHVzZXIsXG4gICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHBhdHRlcm46IC9hcGlcXC9hdXRoXFwvbG9naW4vLFxuICAgICAgICByZXNwb25kZXI6IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgZGF0YSkge1xuICAgICAgICAgIGRhdGEgPSBhbmd1bGFyLmZyb21Kc29uKGRhdGEpO1xuICAgICAgICAgIHZhciB1biA9IGRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgICAgICAgaWYgKHVuID09PSAnYWRtaW4nKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFsyMDQsIHt0b2tlbjogXCJtb2NrdG9rZW5cIn1dO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJJbnZhbGlkIGxvZ2luIG9yIHBhc3N3b3JkXCJ9XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcblxufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZyk7IiwiZnVuY3Rpb24gUHJvZmlsZShSZXN0YW5ndWxhcikge1xuICByZXR1cm4ge1xuICAgIGdldFByb2ZpbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBSZXN0YW5ndWxhci5vbmUoJy9hcGkvYXV0aC9tZScpLmdldCgpO1xuICAgIH1cbiAgfTtcbn1cblxuYW5ndWxhci5tb2R1bGUoXCJtb29uZGFzaFwiKVxuICAuZmFjdG9yeSgnTWRQcm9maWxlJywgUHJvZmlsZSk7XG4iLCJmdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2F1dGgnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2F1dGgnLFxuICAgICAgICAgICAgIHBhcmVudDogJ3Jvb3QnXG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLmxvZ2luJywge1xuICAgICAgICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2F1dGgvdGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsIGFzIGN0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYXV0aC5sb2dvdXQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2xvZ291dCcsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dvdXRDdHJsIGFzIGN0cmwnLFxuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9hdXRoL3RlbXBsYXRlcy9sb2dvdXQuaHRtbCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLnByb2ZpbGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgICAgICAgIC8vYXV0aGVudGljYXRlOiB0cnVlLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9hdXRoL3RlbXBsYXRlcy9wcm9maWxlLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUHJvZmlsZUN0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgICAgIHByb2ZpbGU6IGZ1bmN0aW9uIChNZFByb2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIE1kUHJvZmlsZS5nZXRQcm9maWxlKCk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpOyIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhSZXN0YW5ndWxhclByb3ZpZGVyKSB7XG4gIFJlc3Rhbmd1bGFyUHJvdmlkZXIuc2V0QmFzZVVybCgnL2FwaScpO1xufVxuXG5mdW5jdGlvbiBNZENvbmZpZygpIHtcbiAgdGhpcy5zaXRlTmFtZSA9ICdNb29uZGFzaCc7XG59XG5cblxuYW5ndWxhci5tb2R1bGUoXCJtb29uZGFzaFwiKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZylcbiAgLnNlcnZpY2UoJ01kQ29uZmlnJywgTWRDb25maWcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIiwiZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdyb290LmRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICBzZWN0aW9uOiB7XG4gICAgICAgICAgICAgICBncm91cDogJ3Jvb3QnLFxuICAgICAgICAgICAgICAgbGFiZWw6ICdEYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgcHJpb3JpdHk6IDFcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5EYXNoYm9hcmQ8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LmRhc2hib2FyZC5hbGwnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2FsbCcsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge1xuICAgICAgICAgICAgICAgc2VjdGlvbjogJ3Jvb3QuZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgIGxhYmVsOiAnQWxsJyxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAwXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5kYXNoYm9hcmQuc29tZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc29tZScsXG4gICAgICAgICAgICAgc3Vic2VjdGlvbjoge1xuICAgICAgICAgICAgICAgc2VjdGlvbjogJ3Jvb3QuZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgIGdyb3VwOiAnZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgIGxhYmVsOiAnU29tZSdcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5EYXNoYm9hcmQ8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnNldHRpbmdzJywge1xuICAgICAgICAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICAgICAgICAgc2VjdGlvbjoge1xuICAgICAgICAgICAgICAgZ3JvdXA6ICdyb290JyxcbiAgICAgICAgICAgICAgIGxhYmVsOiAnU2V0dGluZ3MnLFxuICAgICAgICAgICAgICAgcHJpb3JpdHk6IDJcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5TZXR0aW5nczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QudHlwZXMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3R5cGVzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+VHlwZXM8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnR5cGVzLnVzZXJzJywge1xuICAgICAgICAgICAgIHVybDogJy91c2VycycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPlVzZXJzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcy5pbnZvaWNlcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvaW52b2ljZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5JbnZvaWNlczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG59XG5cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSAnSGVsbG8gd29ybGQhJ1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIExheW91dEN0cmwoJHJvb3RTY29wZSwgTWRMYXlvdXQpIHtcbiAgJHJvb3RTY29wZS5sYXlvdXQgPSBNZExheW91dDtcbn1cblxuZnVuY3Rpb24gSGVhZGVyQ3RybCgkc3RhdGUsIE1kQ29uZmlnLCAkYXV0aCkge1xuICB0aGlzLiRhdXRoID0gJGF1dGg7XG4gIHRoaXMuc2l0ZU5hbWUgPSBNZENvbmZpZy5zaXRlTmFtZTtcbn1cblxuZnVuY3Rpb24gU2VjdGlvbnNDdHJsKE1kU2VjdGlvbnMsICRzdGF0ZSkge1xuICB0aGlzLnNlY3Rpb25Hcm91cHMgPSBNZFNlY3Rpb25zLmdldFNlY3Rpb25Hcm91cHMoJHN0YXRlKTtcblxuICB0aGlzLnN1YnNlY3Rpb25zID0gWzEsMiwzXTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbnRyb2xsZXIoJ0xheW91dEN0cmwnLCBMYXlvdXRDdHJsKVxuICAuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIEhlYWRlckN0cmwpXG4gIC5jb250cm9sbGVyKCdTZWN0aW9uc0N0cmwnLCBTZWN0aW9uc0N0cmwpO1xufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiZnVuY3Rpb24gTmVzdGVkU2VjdGlvbkN0cmwoJHNjb3BlKXtcbiAgdGhpcy5pc0NvbGxhcHNlZCA9IHRydWU7XG4gIHRoaXMuc2VjdGlvbiA9ICRzY29wZS5uZ01vZGVsO1xufVxuXG5cbmZ1bmN0aW9uIE5lc3RlZFNlY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6IFwiRVwiLFxuICAgIHRlbXBsYXRlVXJsOiBcIi9sYXlvdXQvdGVtcGxhdGVzL25lc3RlZC1zZWN0aW9uLmh0bWxcIixcbiAgICByZXF1aXJlOiAnXm5nTW9kZWwnLFxuICAgIHNjb3BlOiB7XG4gICAgICBuZ01vZGVsOiAnPW5nTW9kZWwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBOZXN0ZWRTZWN0aW9uQ3RybCxcbiAgICBjb250cm9sbGVyQXM6ICdjdHJsJ1xuICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLmRpcmVjdGl2ZShcIm1kTmVzdGVkU2VjdGlvblwiLCBOZXN0ZWRTZWN0aW9uKTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKTsiLCJmdW5jdGlvbiBNZExheW91dFNlcnZpY2UoJHJvb3RTY29wZSwgTWRDb25maWcpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5wYWdlVGl0bGUgPSBNZENvbmZpZy5zaXRlTmFtZTtcblxuICAvLyBXaGVuZXZlciB0aGUgc3RhdGUgY2hhbmdlcywgdXBkYXRlIHRoZSBwYWdlVGl0bGVcbiAgZnVuY3Rpb24gY2hhbmdlVGl0bGUoZXZ0LCB0b1N0YXRlKSB7XG4gICAgaWYgKHRvU3RhdGUudGl0bGUpIHtcbiAgICAgIC8vIFN1cmUgd291bGQgbGlrZSB0byBhdXRvbWF0aWNhbGx5IHB1dCBpbiByZXNvdXJjZS50aXRsZSBidXRcbiAgICAgIC8vIHVuZm9ydHVuYXRlbHkgdWktcm91dGVyIGRvZXNuJ3QgZ2l2ZSBtZSBhY2Nlc3MgdG8gdGhlIHJlc29sdmVcbiAgICAgIC8vIGZyb20gdGhpcyBldmVudC5cbiAgICAgIF90aGlzLnBhZ2VUaXRsZSA9IE1kQ29uZmlnLnNpdGVOYW1lICsgJyAtICcgKyB0b1N0YXRlLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZXNldCB0byBkZWZhdWx0XG4gICAgICBfdGhpcy5wYWdlVGl0bGUgPSBNZENvbmZpZy5zaXRlTmFtZTtcbiAgICB9XG4gIH1cblxuICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGNoYW5nZVRpdGxlKTtcbn1cblxuZnVuY3Rpb24gTWRTZWN0aW9uc1NlcnZpY2UoKSB7XG4gIHRoaXMuYWRkU2VjdGlvbiA9IGZ1bmN0aW9uIChncm91cElkLCBzZWN0aW9uKSB7XG4gICAgLy8gQWxsb3cgc2l0ZWRldiBhcHAgdG8gZXh0ZW5kIHRoZSByb290IHNlY3Rpb24gZ3JvdXBcbiAgfTtcblxuICB0aGlzLmdldFNlY3Rpb25Hcm91cHMgPSBmdW5jdGlvbiAoJHN0YXRlKSB7XG4gICAgdmFyIHNlY3Rpb25Hcm91cHMgPSB7fSxcbiAgICAgIHNlY3Rpb25zID0ge307XG5cbiAgICAvLyBGaXJzdCBnZXQgYWxsIHRoZSBzZWN0aW9uIGdyb3Vwc1xuICAgIHZhciBhbGxTdGF0ZXMgPSAkc3RhdGUuZ2V0KCk7XG4gICAgXyhhbGxTdGF0ZXMpXG4gICAgICAuZmlsdGVyKCdzZWN0aW9uR3JvdXAnKVxuICAgICAgLmZvckVhY2goXG4gICAgICBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgdmFyIHNnID0gXyhzdGF0ZS5zZWN0aW9uR3JvdXApXG4gICAgICAgICAgLnBpY2soWydsYWJlbCcsICdwcmlvcml0eSddKS52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghc2cubGFiZWwpIHNnLmxhYmVsID0gc3RhdGUudGl0bGU7XG4gICAgICAgIHNnLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbkdyb3Vwc1tzZy5zdGF0ZV0gPSBzZztcbiAgICAgIH0pO1xuXG4gICAgLy8gTm93IGdldCB0aGUgc2VjdGlvbnNcbiAgICBfKGFsbFN0YXRlcykuZmlsdGVyKCdzZWN0aW9uJylcbiAgICAgIC5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHZhciBzZWN0aW9uID0gc3RhdGUuc2VjdGlvbjtcbiAgICAgICAgdmFyIHMgPSBfKHNlY3Rpb24pLnBpY2soWydncm91cCcsICdsYWJlbCcsICdwcmlvcml0eSddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghcy5sYWJlbCkgcy5sYWJlbCA9IHN0YXRlLnRpdGxlO1xuICAgICAgICBzLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbnNbcy5zdGF0ZV0gPSBzO1xuICAgICAgfSk7XG5cbiAgICAvLyBBbmQgYW55IHN1YnNlY3Rpb25zXG4gICAgXyhhbGxTdGF0ZXMpLmZpbHRlcignc3Vic2VjdGlvbicpXG4gICAgICAuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc3Vic2VjdGlvbiA9IHN0YXRlLnN1YnNlY3Rpb247XG4gICAgICAgIHZhciBzZWN0aW9uID0gc2VjdGlvbnNbc3Vic2VjdGlvbi5zZWN0aW9uXTtcblxuICAgICAgICAvLyBJZiB0aGlzIHNlY3Rpb24gZG9lc24ndCB5ZXQgaGF2ZSBhbiBzdWJzZWN0aW9ucywgbWFrZSBvbmVcbiAgICAgICAgaWYgKCFzZWN0aW9uLnN1YnNlY3Rpb25zKSB7XG4gICAgICAgICAgc2VjdGlvbi5zdWJzZWN0aW9ucyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoaXMgc3Vic2VjdGlvblxuICAgICAgICB2YXIgc3MgPSBfKHN1YnNlY3Rpb24pLnBpY2soWydwcmlvcml0eScsICdsYWJlbCddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghc3MubGFiZWwpIHNzLmxhYmVsID0gc3RhdGUudGl0bGU7XG4gICAgICAgIHNzLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbi5zdWJzZWN0aW9ucy5wdXNoKHNzKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gTm93IHJlLWFzc2VtYmxlIHdpdGggc29ydGluZ1xuICAgIHJldHVybiBfKHNlY3Rpb25Hcm91cHMpXG4gICAgICAubWFwKFxuICAgICAgZnVuY3Rpb24gKHNnKSB7XG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHNlY3Rpb25zIGZvciB0aGlzIHNlY3Rpb24gZ3JvdXBcbiAgICAgICAgc2cuc2VjdGlvbnMgPSBfKHNlY3Rpb25zKVxuICAgICAgICAgIC5maWx0ZXIoe2dyb3VwOiBzZy5zdGF0ZX0pXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgaWYgKHMuc3Vic2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgdmFyIG5ld1N1YnNlY3Rpb25zID0gXyhzLnN1YnNlY3Rpb25zKVxuICAgICAgICAgICAgICAgIC5zb3J0QnkoJ3ByaW9yaXR5JylcbiAgICAgICAgICAgICAgICAudmFsdWUoKTtcbiAgICAgICAgICAgICAgcy5zdWJzZWN0aW9ucyA9IG5ld1N1YnNlY3Rpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAgICAgLnZhbHVlKCk7XG4gICAgICAgIHJldHVybiBzZztcbiAgICAgIH0pXG4gICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAudmFsdWUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oJHJvb3RTY29wZSwgTWRMYXlvdXQpIHtcbiAgJHJvb3RTY29wZS5sYXlvdXQgPSBNZExheW91dDtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLnNlcnZpY2UoJ01kTGF5b3V0JywgTWRMYXlvdXRTZXJ2aWNlKVxuICAuc2VydmljZSgnTWRTZWN0aW9ucycsIE1kU2VjdGlvbnNTZXJ2aWNlKVxuICAucnVuKE1vZHVsZVJ1bik7XG4iLCJmdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2xheW91dCcsIHtcbiAgICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvdGVtcGxhdGVzL21kLWxheW91dC5odG1sJyxcbiAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkxheW91dEN0cmxcIlxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdCcsIHtcbiAgICAgICAgICAgICBwYXJlbnQ6ICdsYXlvdXQnLFxuICAgICAgICAgICAgIHNlY3Rpb25Hcm91cDoge1xuICAgICAgICAgICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgcHJpb3JpdHk6IDBcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtaGVhZGVyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvdGVtcGxhdGVzL21kLWhlYWRlci5odG1sJyxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0hlYWRlckN0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAnbWQtc2VjdGlvbnNtZW51Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvdGVtcGxhdGVzL21kLXNlY3Rpb25zbWVudS5odG1sJyxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NlY3Rpb25zQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgdWktdmlldz1cIm1kLWNvbnRlbnRcIj48L2Rpdj4nXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLWZvb3Rlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L3RlbXBsYXRlcy9tZC1mb290ZXIuaHRtbCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKlxuXG4gV2hlbiBydW5uaW5nIGluIGRldiBtb2RlLCBtb2NrIHRoZSBjYWxscyB0byB0aGUgUkVTVCBBUEksIHRoZW5cbiBwYXNzIGV2ZXJ5dGhpbmcgZWxzZSB0aHJvdWdoLlxuXG4gKi9cblxucmVxdWlyZSgnLi9wcm92aWRlcnMnKTtcblxuLy8gVE9ETyBOb3Qgc3VyZSBpZiB0aGVyZSBpcyBhIHdheSwgbm93IHRoYXQgd2UgYXJlIHVzaW5nIENvbW1vbkpTLCB0b1xuLy8gZWxpbWluYXRlIHRoaXMgbGl0dGxlIElJRkUuXG5cbihmdW5jdGlvbiAobW9kKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBtb2QucnVuKGZ1bmN0aW9uICgkaHR0cEJhY2tlbmQsIG1vb25kYXNoTW9ja1Jlc3QpIHtcblxuICAgIG1vb25kYXNoTW9ja1Jlc3QucmVnaXN0ZXJNb2NrcygkaHR0cEJhY2tlbmQpO1xuXG4gICAgLy8gcGFzcyB0aHJvdWdoIGV2ZXJ5dGhpbmcgZWxzZVxuICAgICRodHRwQmFja2VuZC53aGVuR0VUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgICAkaHR0cEJhY2tlbmQud2hlblBPU1QoL1xcLyovKS5wYXNzVGhyb3VnaCgpO1xuICAgICRodHRwQmFja2VuZC53aGVuUFVUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcblxuICB9KTtcblxufShhbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2hNb2NrJywgWydtb29uZGFzaCcsICduZ01vY2tFMkUnXSkpKTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBNb29uZGFzaE1vY2tzKCkge1xuICB0aGlzLm1vY2tzID0ge307XG5cbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2NrcyA9IHRoaXMubW9ja3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2lzdGVyTW9ja3M6IGZ1bmN0aW9uICgkaHR0cEJhY2tlbmQpIHtcbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBtb2NrcyBhbmQgcmVnaXN0ZXIgdGhlbVxuICAgICAgICBfLm1hcChtb2NrcywgZnVuY3Rpb24gKG1vZHVsZU1vY2tzKSB7XG4gICAgICAgICAgXyhtb2R1bGVNb2NrcykuZm9yRWFjaChmdW5jdGlvbiAobW9jaykge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSBkYXRhIGZyb20gdGhlIG1vY2tcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBtb2NrLm1ldGhvZCB8fCAnR0VUJyxcbiAgICAgICAgICAgICAgcGF0dGVybiA9IG1vY2sucGF0dGVybixcbiAgICAgICAgICAgICAgcmVzcG9uZGVyID0gbW9jay5yZXNwb25kZXIsXG4gICAgICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IG1vY2sucmVzcG9uc2VEYXRhO1xuXG4gICAgICAgICAgICB2YXIgd3JhcHBlZFJlc3BvbmRlciA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgZGF0YSwgaGVhZGVycykge1xuXG4gICAgICAgICAgICAgIC8vIElmIHRoZSBtb2NrIHNheXMgdG8gYXV0aGVudGljYXRlIGFuZCB3ZSBkb24ndCBoYXZlXG4gICAgICAgICAgICAgIC8vIGFuIEF1dGhvcml6YXRpb24gaGVhZGVyLCByZXR1cm4gNDAxLlxuICAgICAgICAgICAgICBpZiAobW9jay5hdXRoZW50aWNhdGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXV0aHogPSBoZWFkZXJzWydBdXRob3JpemF0aW9uJ107XG4gICAgICAgICAgICAgICAgaWYgKCFhdXRoeikge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0MDEsIHtcIm1lc3NhZ2VcIjogXCJMb2dpbiByZXF1aXJlZFwifV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQSBnZW5lcmljIHJlc3BvbmRlciBmb3IgaGFuZGxpbmcgdGhlIGNhc2Ugd2hlcmUgdGhlXG4gICAgICAgICAgICAgIC8vIG1vY2sganVzdCB3YW50ZWQgdGhlIGJhc2ljcyBhbmQgc3VwcGxpZWQgcmVzcG9uc2VEYXRhXG4gICAgICAgICAgICAgIGlmICghcmVzcG9uZGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsyMDAsIHJlc3BvbnNlRGF0YV1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEdvdCBoZXJlLCBzbyBsZXQncyBnbyBhaGVhZCBhbmQgY2FsbCB0aGVcbiAgICAgICAgICAgICAgLy8gcmVnaXN0ZXJlZCByZXNwb25kZXJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlcihtZXRob2QsIHVybCwgZGF0YSwgaGVhZGVycylcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICRodHRwQmFja2VuZC53aGVuKG1ldGhvZCwgcGF0dGVybilcbiAgICAgICAgICAgICAgLnJlc3BvbmQod3JhcHBlZFJlc3BvbmRlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgdGhpcy5hZGRNb2NrcyA9IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgdGhpcy5tb2Nrc1trXSA9IHY7XG4gIH07XG59XG5cblxuYW5ndWxhci5tb2R1bGUoXCJtb29uZGFzaFwiKVxuICAucHJvdmlkZXIoJ21vb25kYXNoTW9ja1Jlc3QnLCBNb29uZGFzaE1vY2tzKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiZnVuY3Rpb24gTm90aWNlQ3RybCgkc2NvcGUsICRtb2RhbEluc3RhbmNlLCAkdGltZW91dCwgbWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB2YXIgc2Vjb25kcyA9IDM7XG4gIHZhciB0aW1lciA9ICR0aW1lb3V0KFxuICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9LCBzZWNvbmRzICogMTAwMFxuICApO1xuICAkc2NvcGUuJG9uKFxuICAgICdkZXN0cm95JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkdGltZW91dC5jYW5jZWwodGltZXIpO1xuICAgIH0pXG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb250cm9sbGVyKCdOb3RpY2VDdHJsJywgTm90aWNlQ3RybCk7IiwicmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcycpOyIsImZ1bmN0aW9uIE5vdGljZVNlcnZpY2UoJG1vZGFsKSB7XG4gIHRoaXMuc2hvdyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdub3RpY2VNb2RhbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ05vdGljZUN0cmwgYXMgY3RybCcsXG4gICAgICAgIHNpemU6ICdzbScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBtZXNzYWdlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgbW9kYWxJbnN0YW5jZS5yZXN1bHQudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICB9KTtcblxuICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5zZXJ2aWNlKCckbm90aWNlJywgTm90aWNlU2VydmljZSk7Il19
