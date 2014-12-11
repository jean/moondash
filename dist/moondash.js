(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = [
  // Our submodules
  'moondash.forms',

  // External stuff
  'ngSanitize', 'ui.router', 'restangular', 'satellizer',
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

// Require the Moondash components
require('./layout');
require('./globalsection');
require('./configurator');
require('./mockapi');
require('./auth');
require('./hellotesting');
require('./notice');
require('./forms');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":3,"./configurator":8,"./forms":11,"./globalsection":13,"./hellotesting":15,"./layout":18,"./mockapi":21,"./notice":24}],2:[function(require,module,exports){
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
function FormCtrl(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}


function Form() {
  var directive = {
    restrict: "E",
    templateUrl: "/forms/templates/form.html",
    scope: {
      mdModel: '=mdModel',
      mdSchema: '=mdSchema',
      mdForm: '=mdForm'
    },
    controller: FormCtrl,
    controllerAs: 'ctrl',
    bindToController: true // Note: causes testing problems
  };
  return directive;
}

angular.module("moondash.forms")
  .directive("mdForm", Form);
},{}],11:[function(require,module,exports){
(function (global){
'use strict';

// Define a submodule
var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('moondash.forms', []);


require('./directives');
require('./services');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./directives":10,"./services":12}],12:[function(require,module,exports){
function MdSchemasService() {
  this.schemas = {
    schema1: {
      type: "object",
      properties: {
        name: {
          type: "string",
          minLength: 2,
          title: "Name",
          description: "Name or alias"
        },
        title: {
          type: "string",
          enum: ['dr', 'jr', 'sir', 'mrs', 'mr', 'NaN', 'dj']
        }
      }
    }
  };

  this.get = function (schemaId) {
    // Implement a registry later of schemas loaded in the configurator
    return this.schemas[schemaId];
  };

}

function MdFormsService() {
  this.forms = {
    form1: [
      "*",
      {
        type: "submit",
        title: "Save"
      }
    ]
  };

  this.get = function (formId) {
    // Implement a registry later of forms loaded in the configurator
    return this.forms[formId];
  };

}

angular.module('moondash.forms')
  .service('MdSchemas', MdSchemasService)
  .service('MdForms', MdFormsService);
},{}],13:[function(require,module,exports){
'use strict';

require('./states');

},{"./states":14}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
'use strict';

module.exports = 'Hello world!'

},{}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{}],18:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');
require('./services');
require('./directives');
},{"./controllers":16,"./directives":17,"./services":19,"./states":20}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{"./providers":22}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
require('./controllers');
require('./services');
},{"./controllers":23,"./services":25}],25:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2F1dGgvY29udHJvbGxlcnMuanMiLCJzcmMvYXV0aC9pbmRleC5qcyIsInNyYy9hdXRoL2ludGVyY2VwdG9ycy5qcyIsInNyYy9hdXRoL21vY2tzLmpzIiwic3JjL2F1dGgvc2VydmljZXMuanMiLCJzcmMvYXV0aC9zdGF0ZXMuanMiLCJzcmMvY29uZmlndXJhdG9yL2luZGV4LmpzIiwic3JjL2NvbmZpZ3VyYXRvci9zZXJ2aWNlcy5qcyIsInNyYy9mb3Jtcy9kaXJlY3RpdmVzLmpzIiwic3JjL2Zvcm1zL2luZGV4LmpzIiwic3JjL2Zvcm1zL3NlcnZpY2VzLmpzIiwic3JjL2dsb2JhbHNlY3Rpb24vaW5kZXguanMiLCJzcmMvZ2xvYmFsc2VjdGlvbi9zdGF0ZXMuanMiLCJzcmMvaGVsbG90ZXN0aW5nL2luZGV4LmpzIiwic3JjL2xheW91dC9jb250cm9sbGVycy5qcyIsInNyYy9sYXlvdXQvZGlyZWN0aXZlcy5qcyIsInNyYy9sYXlvdXQvaW5kZXguanMiLCJzcmMvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2xheW91dC9zdGF0ZXMuanMiLCJzcmMvbW9ja2FwaS9pbmRleC5qcyIsInNyYy9tb2NrYXBpL3Byb3ZpZGVycy5qcyIsInNyYy9ub3RpY2UvY29udHJvbGxlcnMuanMiLCJzcmMvbm90aWNlL2luZGV4LmpzIiwic3JjL25vdGljZS9zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuXG4gRGVjbGFyZSB0aGUgbW9kdWxlIHdpdGggZGVwZW5kZW5jaWVzLCBhbmQgbm90aGluZyBtb3JlLlxuXG4gSWYgcnVubmluZyBpbiBcImRldmVsb3BtZW50IG1vZGVcIiwgaW5qZWN0IHRoZSBtb2NrIGluZnJhc3RydWN0dXJlLlxuXG4gKi9cblxudmFyIGRlcGVuZGVuY2llcyA9IFtcbiAgLy8gT3VyIHN1Ym1vZHVsZXNcbiAgJ21vb25kYXNoLmZvcm1zJyxcblxuICAvLyBFeHRlcm5hbCBzdHVmZlxuICAnbmdTYW5pdGl6ZScsICd1aS5yb3V0ZXInLCAncmVzdGFuZ3VsYXInLCAnc2F0ZWxsaXplcicsXG4gICd1aS5ib290c3RyYXAubW9kYWwnLCAndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgJ3NjaGVtYUZvcm0nXTtcblxuLy8gSWYgbmdNb2NrIGlzIGxvYWRlZCwgaXQgdGFrZXMgb3ZlciB0aGUgYmFja2VuZC4gV2Ugc2hvdWxkIG9ubHkgYWRkXG4vLyBpdCB0byB0aGUgbGlzdCBvZiBtb2R1bGUgZGVwZW5kZW5jaWVzIGlmIHdlIGFyZSBpbiBcImZyb250ZW5kIG1vY2tcIlxuLy8gbW9kZS4gRmxhZyB0aGlzIGJ5IHB1dHRpbmcgdGhlIGNsYXNzIC5mcm9udGVuZE1vY2sgb24gc29tZSBlbGVtZW50XG4vLyBpbiB0aGUgZGVtbyAuaHRtbCBwYWdlLlxudmFyIG1vY2tBcGkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubW9ja0FwaScpO1xuaWYgKG1vY2tBcGkpIHtcbiAgZGVwZW5kZW5jaWVzLnB1c2goJ25nTW9ja0UyRScpO1xuICBkZXBlbmRlbmNpZXMucHVzaCgnbW9vbmRhc2hNb2NrJyk7XG59XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJywgZGVwZW5kZW5jaWVzKTtcblxuLy8gUmVxdWlyZSB0aGUgTW9vbmRhc2ggY29tcG9uZW50c1xucmVxdWlyZSgnLi9sYXlvdXQnKTtcbnJlcXVpcmUoJy4vZ2xvYmFsc2VjdGlvbicpO1xucmVxdWlyZSgnLi9jb25maWd1cmF0b3InKTtcbnJlcXVpcmUoJy4vbW9ja2FwaScpO1xucmVxdWlyZSgnLi9hdXRoJyk7XG5yZXF1aXJlKCcuL2hlbGxvdGVzdGluZycpO1xucmVxdWlyZSgnLi9ub3RpY2UnKTtcbnJlcXVpcmUoJy4vZm9ybXMnKTtcblxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJmdW5jdGlvbiBMb2dpbkN0cmwoJGF1dGgsICRub3RpY2UpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5lcnJvck1lc3NhZ2UgPSBmYWxzZTtcblxuICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKCR2YWxpZCwgdXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgJGF1dGgubG9naW4oe3VzZXJuYW1lOiB1c2VybmFtZSwgcGFzc3dvcmQ6IHBhc3N3b3JkfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgX3RoaXMuZXJyb3JNZXNzYWdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICRub3RpY2Uuc2hvdygnWW91IGhhdmUgc3VjY2Vzc2Z1bGx5IGxvZ2dlZCBpbicpO1xuICAgICAgICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgIF90aGlzLmVycm9yTWVzc2FnZSA9IHJlc3BvbnNlLmRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBMb2dvdXRDdHJsKCRhdXRoLCAkbm90aWNlKSB7XG4gICRhdXRoLmxvZ291dCgpXG4gICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG5vdGljZS5zaG93KCdZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQnKTtcbiAgICAgICAgICB9KTtcbn1cblxuZnVuY3Rpb24gUHJvZmlsZUN0cmwocHJvZmlsZSkge1xuICB0aGlzLnByb2ZpbGUgPSBwcm9maWxlO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKVxuICAuY29udHJvbGxlcignTG9nb3V0Q3RybCcsIExvZ291dEN0cmwpXG4gIC5jb250cm9sbGVyKCdQcm9maWxlQ3RybCcsIFByb2ZpbGVDdHJsKTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JzJylcbnJlcXVpcmUoJy4vbW9ja3MnKTtcbiIsImZ1bmN0aW9uIEF1dGh6UmVzcG9uc2VSZWRpcmVjdCgkcSwgJGluamVjdG9yKSB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XG4gICAgICB2YXJcbiAgICAgICAgJHN0YXRlID0gJGluamVjdG9yLmdldCgnJHN0YXRlJyksXG4gICAgICAgICRub3RpY2UgPSAkaW5qZWN0b3IuZ2V0KCckbm90aWNlJyk7XG5cbiAgICAgIC8vIFdlIGNhbiBnZXQgYW4gL2FwaS8gcmVzcG9uc2Ugb2YgZm9yYmlkZGVuIGZvclxuICAgICAgLy8gc29tZSBkYXRhIG5lZWRlZCBpbiBhIHZpZXcuIEZsYXNoIGEgbm90aWNlIHNheWluZyB0aGF0IHRoaXNcbiAgICAgIC8vIGRhdGEgd2FzIHJlcXVlc3RlZC5cbiAgICAgIHZhciB1cmwgPSByZWplY3Rpb24uY29uZmlnLnVybDtcbiAgICAgIGlmIChyZWplY3Rpb24uc3RhdHVzID09IDQwMyB8fCByZWplY3Rpb24uc3RhdHVzID09IDQwMSkge1xuICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgbG9naW4gZm9ybVxuICAgICAgICAkc3RhdGUuZ28oJ2F1dGgubG9naW4nKTtcbiAgICAgICAgdmFyIG1zZyA9ICdMb2dpbiByZXF1aXJlZCBmb3IgZGF0YSBhdDogJyArIHVybDtcbiAgICAgICAgJG5vdGljZS5zaG93KG1zZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJGh0dHBQcm92aWRlciwgJGF1dGhQcm92aWRlcikge1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoelJlZGlyZWN0Jyk7XG5cbiAgdmFyIGJhc2VVcmwgPSAnJztcblxuICAvLyBTYXRlbGxpemVyIHNldHVwXG4gICRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBiYXNlVXJsICsgJy9hcGkvYXV0aC9sb2dpbic7XG59XG5cbmZ1bmN0aW9uIE1vZHVsZVJ1bigkcm9vdFNjb3BlLCAkc3RhdGUsICRhdXRoLCAkbm90aWNlKSB7XG4gIC8vIEEgc3RhdGUgY2FuIGJlIGFubm90YXRlZCB3aXRoIGEgdmFsdWUgaW5kaWNhdGluZ1xuICAvLyB0aGUgc3RhdGUgcmVxdWlyZXMgbG9naW4uXG5cbiAgJHJvb3RTY29wZS4kb24oXG4gICAgXCIkc3RhdGVDaGFuZ2VTdGFydFwiLFxuICAgIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSkge1xuICAgICAgaWYgKHRvU3RhdGUuYXV0aGVudGljYXRlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzbuKAmXQgYXV0aGVudGljYXRlZCBhbmQgdGhpcyBzdGF0ZSB3YW50cyBhdXRoXG4gICAgICAgIHZhciB0ID0gdG9TdGF0ZS50aXRsZSB8fCB0b1N0YXRlLm5hbWU7XG4gICAgICAgIHZhciBtc2cgPSAnVGhlIHBhZ2UgJyArIHQgKyAnIHJlcXVpcmVzIGEgbG9naW4nO1xuICAgICAgICAkbm90aWNlLnNob3cobXNnKVxuICAgICAgICAkc3RhdGUudHJhbnNpdGlvblRvKFwiYXV0aC5sb2dpblwiKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuZmFjdG9yeSgnYXV0aHpSZWRpcmVjdCcsIEF1dGh6UmVzcG9uc2VSZWRpcmVjdClcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5ydW4oTW9kdWxlUnVuKTsiLCJmdW5jdGlvbiBNb2R1bGVDb25maWcobW9vbmRhc2hNb2NrUmVzdFByb3ZpZGVyKSB7XG5cbiAgdmFyIHVzZXIgPSB7XG4gICAgaWQ6ICdhZG1pbicsXG4gICAgZW1haWw6ICdhZG1pbkB4LmNvbScsXG4gICAgZmlyc3RfbmFtZTogJ0FkbWluJyxcbiAgICBsYXN0X25hbWU6ICdMYXN0aWUnLFxuICAgIHR3aXR0ZXI6ICdhZG1pbidcbiAgfTtcblxuICBtb29uZGFzaE1vY2tSZXN0UHJvdmlkZXIuYWRkTW9ja3MoXG4gICAgJ2F1dGgnLFxuICAgIFtcbiAgICAgIHtcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9tZS8sXG4gICAgICAgIHJlc3BvbnNlRGF0YTogdXNlcixcbiAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgcGF0dGVybjogL2FwaVxcL2F1dGhcXC9sb2dpbi8sXG4gICAgICAgIHJlc3BvbmRlcjogZnVuY3Rpb24gKG1ldGhvZCwgdXJsLCBkYXRhKSB7XG4gICAgICAgICAgZGF0YSA9IGFuZ3VsYXIuZnJvbUpzb24oZGF0YSk7XG4gICAgICAgICAgdmFyIHVuID0gZGF0YS51c2VybmFtZTtcbiAgICAgICAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICAgICAgICBpZiAodW4gPT09ICdhZG1pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzIwNCwge3Rva2VuOiBcIm1vY2t0b2tlblwifV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gWzQwMSwge1wibWVzc2FnZVwiOiBcIkludmFsaWQgbG9naW4gb3IgcGFzc3dvcmRcIn1dO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuXG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKTsiLCJmdW5jdGlvbiBQcm9maWxlKFJlc3Rhbmd1bGFyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UHJvZmlsZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLm9uZSgnL2FwaS9hdXRoL21lJykuZ2V0KCk7XG4gICAgfVxuICB9O1xufVxuXG5hbmd1bGFyLm1vZHVsZShcIm1vb25kYXNoXCIpXG4gIC5mYWN0b3J5KCdNZFByb2ZpbGUnLCBQcm9maWxlKTtcbiIsImZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXV0aCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYXV0aCcsXG4gICAgICAgICAgICAgcGFyZW50OiAncm9vdCdcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2F1dGgubG9naW4nLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvYXV0aC90ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLmxvZ291dCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbG9nb3V0JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ291dEN0cmwgYXMgY3RybCcsXG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2F1dGgvdGVtcGxhdGVzL2xvZ291dC5odG1sJ1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2F1dGgucHJvZmlsZScsIHtcbiAgICAgICAgICAgICB1cmw6ICcvcHJvZmlsZScsXG4gICAgICAgICAgICAgLy9hdXRoZW50aWNhdGU6IHRydWUsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2F1dGgvdGVtcGxhdGVzL3Byb2ZpbGUuaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKE1kUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICByZXR1cm4gTWRQcm9maWxlLmdldFByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTW9kdWxlQ29uZmlnKFJlc3Rhbmd1bGFyUHJvdmlkZXIpIHtcbiAgUmVzdGFuZ3VsYXJQcm92aWRlci5zZXRCYXNlVXJsKCcvYXBpJyk7XG59XG5cbmZ1bmN0aW9uIE1kQ29uZmlnKCkge1xuICB0aGlzLnNpdGVOYW1lID0gJ01vb25kYXNoJztcbn1cblxuXG5hbmd1bGFyLm1vZHVsZShcIm1vb25kYXNoXCIpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKVxuICAuc2VydmljZSgnTWRDb25maWcnLCBNZENvbmZpZyk7XG4iLCJmdW5jdGlvbiBGb3JtQ3RybChNZFNjaGVtYXMsIE1kRm9ybXMpIHtcbiAgdGhpcy5tb2RlbCA9IHRoaXMubWRNb2RlbDtcbiAgdGhpcy5zY2hlbWEgPSBNZFNjaGVtYXMuZ2V0KHRoaXMubWRTY2hlbWEpO1xuICB0aGlzLmZvcm0gPSBNZEZvcm1zLmdldCh0aGlzLm1kRm9ybSk7XG59XG5cblxuZnVuY3Rpb24gRm9ybSgpIHtcbiAgdmFyIGRpcmVjdGl2ZSA9IHtcbiAgICByZXN0cmljdDogXCJFXCIsXG4gICAgdGVtcGxhdGVVcmw6IFwiL2Zvcm1zL3RlbXBsYXRlcy9mb3JtLmh0bWxcIixcbiAgICBzY29wZToge1xuICAgICAgbWRNb2RlbDogJz1tZE1vZGVsJyxcbiAgICAgIG1kU2NoZW1hOiAnPW1kU2NoZW1hJyxcbiAgICAgIG1kRm9ybTogJz1tZEZvcm0nXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBGb3JtQ3RybCxcbiAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlIC8vIE5vdGU6IGNhdXNlcyB0ZXN0aW5nIHByb2JsZW1zXG4gIH07XG4gIHJldHVybiBkaXJlY3RpdmU7XG59XG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2guZm9ybXNcIilcbiAgLmRpcmVjdGl2ZShcIm1kRm9ybVwiLCBGb3JtKTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbi8vIERlZmluZSBhIHN1Ym1vZHVsZVxudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2guZm9ybXMnLCBbXSk7XG5cblxucmVxdWlyZSgnLi9kaXJlY3RpdmVzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5cblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiZnVuY3Rpb24gTWRTY2hlbWFzU2VydmljZSgpIHtcbiAgdGhpcy5zY2hlbWFzID0ge1xuICAgIHNjaGVtYTE6IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG5hbWU6IHtcbiAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgIG1pbkxlbmd0aDogMixcbiAgICAgICAgICB0aXRsZTogXCJOYW1lXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiTmFtZSBvciBhbGlhc1wiXG4gICAgICAgIH0sXG4gICAgICAgIHRpdGxlOiB7XG4gICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICBlbnVtOiBbJ2RyJywgJ2pyJywgJ3NpcicsICdtcnMnLCAnbXInLCAnTmFOJywgJ2RqJ11cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB0aGlzLmdldCA9IGZ1bmN0aW9uIChzY2hlbWFJZCkge1xuICAgIC8vIEltcGxlbWVudCBhIHJlZ2lzdHJ5IGxhdGVyIG9mIHNjaGVtYXMgbG9hZGVkIGluIHRoZSBjb25maWd1cmF0b3JcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFzW3NjaGVtYUlkXTtcbiAgfTtcblxufVxuXG5mdW5jdGlvbiBNZEZvcm1zU2VydmljZSgpIHtcbiAgdGhpcy5mb3JtcyA9IHtcbiAgICBmb3JtMTogW1xuICAgICAgXCIqXCIsXG4gICAgICB7XG4gICAgICAgIHR5cGU6IFwic3VibWl0XCIsXG4gICAgICAgIHRpdGxlOiBcIlNhdmVcIlxuICAgICAgfVxuICAgIF1cbiAgfTtcblxuICB0aGlzLmdldCA9IGZ1bmN0aW9uIChmb3JtSWQpIHtcbiAgICAvLyBJbXBsZW1lbnQgYSByZWdpc3RyeSBsYXRlciBvZiBmb3JtcyBsb2FkZWQgaW4gdGhlIGNvbmZpZ3VyYXRvclxuICAgIHJldHVybiB0aGlzLmZvcm1zW2Zvcm1JZF07XG4gIH07XG5cbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoLmZvcm1zJylcbiAgLnNlcnZpY2UoJ01kU2NoZW1hcycsIE1kU2NoZW1hc1NlcnZpY2UpXG4gIC5zZXJ2aWNlKCdNZEZvcm1zJywgTWRGb3Jtc1NlcnZpY2UpOyIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgncm9vdC5kYXNoYm9hcmQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgc2VjdGlvbjoge1xuICAgICAgICAgICAgICAgZ3JvdXA6ICdyb290JyxcbiAgICAgICAgICAgICAgIGxhYmVsOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAxXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5kYXNoYm9hcmQuYWxsJywge1xuICAgICAgICAgICAgIHVybDogJy9hbGwnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIHNlY3Rpb246ICdyb290LmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ0FsbCcsXG4gICAgICAgICAgICAgICBwcmlvcml0eTogMFxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPkRhc2hib2FyZDwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QuZGFzaGJvYXJkLnNvbWUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NvbWUnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIHNlY3Rpb246ICdyb290LmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBncm91cDogJ2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ1NvbWUnXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5zZXR0aW5ncycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgICAgICAgIHNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIGdyb3VwOiAncm9vdCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAyXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+U2V0dGluZ3M8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnR5cGVzJywge1xuICAgICAgICAgICAgIHVybDogJy90eXBlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPlR5cGVzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcy51c2VycycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5Vc2VyczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QudHlwZXMuaW52b2ljZXMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2ludm9pY2VzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+SW52b2ljZXM8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gJ0hlbGxvIHdvcmxkISdcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBMYXlvdXRDdHJsKCRyb290U2NvcGUsIE1kTGF5b3V0KSB7XG4gICRyb290U2NvcGUubGF5b3V0ID0gTWRMYXlvdXQ7XG59XG5cbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHN0YXRlLCBNZENvbmZpZywgJGF1dGgpIHtcbiAgdGhpcy4kYXV0aCA9ICRhdXRoO1xuICB0aGlzLnNpdGVOYW1lID0gTWRDb25maWcuc2l0ZU5hbWU7XG59XG5cbmZ1bmN0aW9uIFNlY3Rpb25zQ3RybChNZFNlY3Rpb25zLCAkc3RhdGUpIHtcbiAgdGhpcy5zZWN0aW9uR3JvdXBzID0gTWRTZWN0aW9ucy5nZXRTZWN0aW9uR3JvdXBzKCRzdGF0ZSk7XG5cbiAgdGhpcy5zdWJzZWN0aW9ucyA9IFsxLDIsM107XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb250cm9sbGVyKCdMYXlvdXRDdHJsJywgTGF5b3V0Q3RybClcbiAgLmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBIZWFkZXJDdHJsKVxuICAuY29udHJvbGxlcignU2VjdGlvbnNDdHJsJywgU2VjdGlvbnNDdHJsKTtcbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImZ1bmN0aW9uIE5lc3RlZFNlY3Rpb25DdHJsKCRzY29wZSl7XG4gIHRoaXMuaXNDb2xsYXBzZWQgPSB0cnVlO1xuICB0aGlzLnNlY3Rpb24gPSAkc2NvcGUubmdNb2RlbDtcbn1cblxuXG5mdW5jdGlvbiBOZXN0ZWRTZWN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiBcIkVcIixcbiAgICB0ZW1wbGF0ZVVybDogXCIvbGF5b3V0L3RlbXBsYXRlcy9uZXN0ZWQtc2VjdGlvbi5odG1sXCIsXG4gICAgcmVxdWlyZTogJ15uZ01vZGVsJyxcbiAgICBzY29wZToge1xuICAgICAgbmdNb2RlbDogJz1uZ01vZGVsJ1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogTmVzdGVkU2VjdGlvbkN0cmwsXG4gICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZShcIm1vb25kYXNoXCIpXG4gIC5kaXJlY3RpdmUoXCJtZE5lc3RlZFNlY3Rpb25cIiwgTmVzdGVkU2VjdGlvbik7IiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzJyk7IiwiZnVuY3Rpb24gTWRMYXlvdXRTZXJ2aWNlKCRyb290U2NvcGUsIE1kQ29uZmlnKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMucGFnZVRpdGxlID0gTWRDb25maWcuc2l0ZU5hbWU7XG5cbiAgLy8gV2hlbmV2ZXIgdGhlIHN0YXRlIGNoYW5nZXMsIHVwZGF0ZSB0aGUgcGFnZVRpdGxlXG4gIGZ1bmN0aW9uIGNoYW5nZVRpdGxlKGV2dCwgdG9TdGF0ZSkge1xuICAgIGlmICh0b1N0YXRlLnRpdGxlKSB7XG4gICAgICAvLyBTdXJlIHdvdWxkIGxpa2UgdG8gYXV0b21hdGljYWxseSBwdXQgaW4gcmVzb3VyY2UudGl0bGUgYnV0XG4gICAgICAvLyB1bmZvcnR1bmF0ZWx5IHVpLXJvdXRlciBkb2Vzbid0IGdpdmUgbWUgYWNjZXNzIHRvIHRoZSByZXNvbHZlXG4gICAgICAvLyBmcm9tIHRoaXMgZXZlbnQuXG4gICAgICBfdGhpcy5wYWdlVGl0bGUgPSBNZENvbmZpZy5zaXRlTmFtZSArICcgLSAnICsgdG9TdGF0ZS50aXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVzZXQgdG8gZGVmYXVsdFxuICAgICAgX3RoaXMucGFnZVRpdGxlID0gTWRDb25maWcuc2l0ZU5hbWU7XG4gICAgfVxuICB9XG5cbiAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBjaGFuZ2VUaXRsZSk7XG59XG5cbmZ1bmN0aW9uIE1kU2VjdGlvbnNTZXJ2aWNlKCkge1xuICB0aGlzLmFkZFNlY3Rpb24gPSBmdW5jdGlvbiAoZ3JvdXBJZCwgc2VjdGlvbikge1xuICAgIC8vIEFsbG93IHNpdGVkZXYgYXBwIHRvIGV4dGVuZCB0aGUgcm9vdCBzZWN0aW9uIGdyb3VwXG4gIH07XG5cbiAgdGhpcy5nZXRTZWN0aW9uR3JvdXBzID0gZnVuY3Rpb24gKCRzdGF0ZSkge1xuICAgIHZhciBzZWN0aW9uR3JvdXBzID0ge30sXG4gICAgICBzZWN0aW9ucyA9IHt9O1xuXG4gICAgLy8gRmlyc3QgZ2V0IGFsbCB0aGUgc2VjdGlvbiBncm91cHNcbiAgICB2YXIgYWxsU3RhdGVzID0gJHN0YXRlLmdldCgpO1xuICAgIF8oYWxsU3RhdGVzKVxuICAgICAgLmZpbHRlcignc2VjdGlvbkdyb3VwJylcbiAgICAgIC5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHZhciBzZyA9IF8oc3RhdGUuc2VjdGlvbkdyb3VwKVxuICAgICAgICAgIC5waWNrKFsnbGFiZWwnLCAncHJpb3JpdHknXSkudmFsdWUoKTtcbiAgICAgICAgLy8gSWYgbm8gbGFiZWwsIHRyeSBhIHRpdGxlIG9uIHRoZSBzdGF0ZVxuICAgICAgICBpZiAoIXNnLmxhYmVsKSBzZy5sYWJlbCA9IHN0YXRlLnRpdGxlO1xuICAgICAgICBzZy5zdGF0ZSA9IHN0YXRlLm5hbWU7XG4gICAgICAgIHNlY3Rpb25Hcm91cHNbc2cuc3RhdGVdID0gc2c7XG4gICAgICB9KTtcblxuICAgIC8vIE5vdyBnZXQgdGhlIHNlY3Rpb25zXG4gICAgXyhhbGxTdGF0ZXMpLmZpbHRlcignc2VjdGlvbicpXG4gICAgICAuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc2VjdGlvbiA9IHN0YXRlLnNlY3Rpb247XG4gICAgICAgIHZhciBzID0gXyhzZWN0aW9uKS5waWNrKFsnZ3JvdXAnLCAnbGFiZWwnLCAncHJpb3JpdHknXSlcbiAgICAgICAgICAudmFsdWUoKTtcbiAgICAgICAgLy8gSWYgbm8gbGFiZWwsIHRyeSBhIHRpdGxlIG9uIHRoZSBzdGF0ZVxuICAgICAgICBpZiAoIXMubGFiZWwpIHMubGFiZWwgPSBzdGF0ZS50aXRsZTtcbiAgICAgICAgcy5zdGF0ZSA9IHN0YXRlLm5hbWU7XG4gICAgICAgIHNlY3Rpb25zW3Muc3RhdGVdID0gcztcbiAgICAgIH0pO1xuXG4gICAgLy8gQW5kIGFueSBzdWJzZWN0aW9uc1xuICAgIF8oYWxsU3RhdGVzKS5maWx0ZXIoJ3N1YnNlY3Rpb24nKVxuICAgICAgLmZvckVhY2goXG4gICAgICBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgdmFyIHN1YnNlY3Rpb24gPSBzdGF0ZS5zdWJzZWN0aW9uO1xuICAgICAgICB2YXIgc2VjdGlvbiA9IHNlY3Rpb25zW3N1YnNlY3Rpb24uc2VjdGlvbl07XG5cbiAgICAgICAgLy8gSWYgdGhpcyBzZWN0aW9uIGRvZXNuJ3QgeWV0IGhhdmUgYW4gc3Vic2VjdGlvbnMsIG1ha2Ugb25lXG4gICAgICAgIGlmICghc2VjdGlvbi5zdWJzZWN0aW9ucykge1xuICAgICAgICAgIHNlY3Rpb24uc3Vic2VjdGlvbnMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkZCB0aGlzIHN1YnNlY3Rpb25cbiAgICAgICAgdmFyIHNzID0gXyhzdWJzZWN0aW9uKS5waWNrKFsncHJpb3JpdHknLCAnbGFiZWwnXSlcbiAgICAgICAgICAudmFsdWUoKTtcbiAgICAgICAgLy8gSWYgbm8gbGFiZWwsIHRyeSBhIHRpdGxlIG9uIHRoZSBzdGF0ZVxuICAgICAgICBpZiAoIXNzLmxhYmVsKSBzcy5sYWJlbCA9IHN0YXRlLnRpdGxlO1xuICAgICAgICBzcy5zdGF0ZSA9IHN0YXRlLm5hbWU7XG4gICAgICAgIHNlY3Rpb24uc3Vic2VjdGlvbnMucHVzaChzcyk7XG4gICAgICB9KTtcblxuICAgIC8vIE5vdyByZS1hc3NlbWJsZSB3aXRoIHNvcnRpbmdcbiAgICByZXR1cm4gXyhzZWN0aW9uR3JvdXBzKVxuICAgICAgLm1hcChcbiAgICAgIGZ1bmN0aW9uIChzZykge1xuICAgICAgICAvLyBHZXQgYWxsIHRoZSBzZWN0aW9ucyBmb3IgdGhpcyBzZWN0aW9uIGdyb3VwXG4gICAgICAgIHNnLnNlY3Rpb25zID0gXyhzZWN0aW9ucylcbiAgICAgICAgICAuZmlsdGVyKHtncm91cDogc2cuc3RhdGV9KVxuICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN1YnNlY3Rpb25zKSB7XG4gICAgICAgICAgICAgIHZhciBuZXdTdWJzZWN0aW9ucyA9IF8ocy5zdWJzZWN0aW9ucylcbiAgICAgICAgICAgICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAgICAgICAgICAgLnZhbHVlKCk7XG4gICAgICAgICAgICAgIHMuc3Vic2VjdGlvbnMgPSBuZXdTdWJzZWN0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnNvcnRCeSgncHJpb3JpdHknKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICByZXR1cm4gc2c7XG4gICAgICB9KVxuICAgICAgLnNvcnRCeSgncHJpb3JpdHknKVxuICAgICAgLnZhbHVlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKCRyb290U2NvcGUsIE1kTGF5b3V0KSB7XG4gICRyb290U2NvcGUubGF5b3V0ID0gTWRMYXlvdXQ7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5zZXJ2aWNlKCdNZExheW91dCcsIE1kTGF5b3V0U2VydmljZSlcbiAgLnNlcnZpY2UoJ01kU2VjdGlvbnMnLCBNZFNlY3Rpb25zU2VydmljZSlcbiAgLnJ1bihNb2R1bGVSdW4pO1xuIiwiZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdsYXlvdXQnLCB7XG4gICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L3RlbXBsYXRlcy9tZC1sYXlvdXQuaHRtbCcsXG4gICAgICAgICAgICAgY29udHJvbGxlcjogXCJMYXlvdXRDdHJsXCJcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgICBzZWN0aW9uR3JvdXA6IHtcbiAgICAgICAgICAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAwXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWhlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L3RlbXBsYXRlcy9tZC1oZWFkZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIZWFkZXJDdHJsIGFzIGN0cmwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLXNlY3Rpb25zbWVudSc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L3RlbXBsYXRlcy9tZC1zZWN0aW9uc21lbnUuaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTZWN0aW9uc0N0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAnbWQtY29udGVudCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IHVpLXZpZXc9XCJtZC1jb250ZW50XCI+PC9kaXY+J1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1mb290ZXInOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xheW91dC90ZW1wbGF0ZXMvbWQtZm9vdGVyLmh0bWwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpOyIsIid1c2Ugc3RyaWN0JztcblxuLypcblxuIFdoZW4gcnVubmluZyBpbiBkZXYgbW9kZSwgbW9jayB0aGUgY2FsbHMgdG8gdGhlIFJFU1QgQVBJLCB0aGVuXG4gcGFzcyBldmVyeXRoaW5nIGVsc2UgdGhyb3VnaC5cblxuICovXG5cbnJlcXVpcmUoJy4vcHJvdmlkZXJzJyk7XG5cbi8vIFRPRE8gTm90IHN1cmUgaWYgdGhlcmUgaXMgYSB3YXksIG5vdyB0aGF0IHdlIGFyZSB1c2luZyBDb21tb25KUywgdG9cbi8vIGVsaW1pbmF0ZSB0aGlzIGxpdHRsZSBJSUZFLlxuXG4oZnVuY3Rpb24gKG1vZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgbW9kLnJ1bihmdW5jdGlvbiAoJGh0dHBCYWNrZW5kLCBtb29uZGFzaE1vY2tSZXN0KSB7XG5cbiAgICBtb29uZGFzaE1vY2tSZXN0LnJlZ2lzdGVyTW9ja3MoJGh0dHBCYWNrZW5kKTtcblxuICAgIC8vIHBhc3MgdGhyb3VnaCBldmVyeXRoaW5nIGVsc2VcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG4gICAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgICAkaHR0cEJhY2tlbmQud2hlblBVVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG5cbiAgfSk7XG5cbn0oYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoTW9jaycsIFsnbW9vbmRhc2gnLCAnbmdNb2NrRTJFJ10pKSk7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gTW9vbmRhc2hNb2NrcygpIHtcbiAgdGhpcy5tb2NrcyA9IHt9O1xuXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9ja3MgPSB0aGlzLm1vY2tzO1xuICAgIHJldHVybiB7XG4gICAgICByZWdpc3Rlck1vY2tzOiBmdW5jdGlvbiAoJGh0dHBCYWNrZW5kKSB7XG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgbW9ja3MgYW5kIHJlZ2lzdGVyIHRoZW1cbiAgICAgICAgXy5tYXAobW9ja3MsIGZ1bmN0aW9uIChtb2R1bGVNb2Nrcykge1xuICAgICAgICAgIF8obW9kdWxlTW9ja3MpLmZvckVhY2goZnVuY3Rpb24gKG1vY2spIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgZGF0YSBmcm9tIHRoZSBtb2NrXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gbW9jay5tZXRob2QgfHwgJ0dFVCcsXG4gICAgICAgICAgICAgIHBhdHRlcm4gPSBtb2NrLnBhdHRlcm4sXG4gICAgICAgICAgICAgIHJlc3BvbmRlciA9IG1vY2sucmVzcG9uZGVyLFxuICAgICAgICAgICAgICByZXNwb25zZURhdGEgPSBtb2NrLnJlc3BvbnNlRGF0YTtcblxuICAgICAgICAgICAgdmFyIHdyYXBwZWRSZXNwb25kZXIgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwsIGRhdGEsIGhlYWRlcnMpIHtcblxuICAgICAgICAgICAgICAvLyBJZiB0aGUgbW9jayBzYXlzIHRvIGF1dGhlbnRpY2F0ZSBhbmQgd2UgZG9uJ3QgaGF2ZVxuICAgICAgICAgICAgICAvLyBhbiBBdXRob3JpemF0aW9uIGhlYWRlciwgcmV0dXJuIDQwMS5cbiAgICAgICAgICAgICAgaWYgKG1vY2suYXV0aGVudGljYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF1dGh6ID0gaGVhZGVyc1snQXV0aG9yaXphdGlvbiddO1xuICAgICAgICAgICAgICAgIGlmICghYXV0aHopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbNDAxLCB7XCJtZXNzYWdlXCI6IFwiTG9naW4gcmVxdWlyZWRcIn1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEEgZ2VuZXJpYyByZXNwb25kZXIgZm9yIGhhbmRsaW5nIHRoZSBjYXNlIHdoZXJlIHRoZVxuICAgICAgICAgICAgICAvLyBtb2NrIGp1c3Qgd2FudGVkIHRoZSBiYXNpY3MgYW5kIHN1cHBsaWVkIHJlc3BvbnNlRGF0YVxuICAgICAgICAgICAgICBpZiAoIXJlc3BvbmRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbMjAwLCByZXNwb25zZURhdGFdXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBHb3QgaGVyZSwgc28gbGV0J3MgZ28gYWhlYWQgYW5kIGNhbGwgdGhlXG4gICAgICAgICAgICAgIC8vIHJlZ2lzdGVyZWQgcmVzcG9uZGVyXG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25kZXIobWV0aG9kLCB1cmwsIGRhdGEsIGhlYWRlcnMpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkaHR0cEJhY2tlbmQud2hlbihtZXRob2QsIHBhdHRlcm4pXG4gICAgICAgICAgICAgIC5yZXNwb25kKHdyYXBwZWRSZXNwb25kZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHRoaXMuYWRkTW9ja3MgPSBmdW5jdGlvbiAoaywgdikge1xuICAgIHRoaXMubW9ja3Nba10gPSB2O1xuICB9O1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLnByb3ZpZGVyKCdtb29uZGFzaE1vY2tSZXN0JywgTW9vbmRhc2hNb2Nrcyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImZ1bmN0aW9uIE5vdGljZUN0cmwoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgdmFyIHNlY29uZHMgPSAzO1xuICB2YXIgdGltZXIgPSAkdGltZW91dChcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfSwgc2Vjb25kcyAqIDEwMDBcbiAgKTtcbiAgJHNjb3BlLiRvbihcbiAgICAnZGVzdHJveScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9KVxufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29udHJvbGxlcignTm90aWNlQ3RybCcsIE5vdGljZUN0cmwpOyIsInJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMnKTsiLCJmdW5jdGlvbiBOb3RpY2VTZXJ2aWNlKCRtb2RhbCkge1xuICB0aGlzLnNob3cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbm90aWNlTW9kYWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdOb3RpY2VDdHJsIGFzIGN0cmwnLFxuICAgICAgICBzaXplOiAnc20nLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgbWVzc2FnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSk7XG5cbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuc2VydmljZSgnJG5vdGljZScsIE5vdGljZVNlcnZpY2UpOyJdfQ==
