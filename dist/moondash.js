(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

/*
TODO This needs to be put in browserify to get into moondash-vendors
instead of moondash.js. But it's complicated:
- angular-bootstrap provides an npm package
- But that packaging does not include concatenated version of submodules
- I can't figure out the right namespaces to put into the browser field
 */
require('angular-bootstrap/src/transition/transition');
require('angular-bootstrap/src/modal/modal');

var dependencies = ['ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal'];

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
require('./notice');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":5,"./configurator":10,"./globalsection":12,"./layout":15,"./mockapi":18,"./notice":21,"angular-bootstrap/src/modal/modal":2,"angular-bootstrap/src/transition/transition":3}],2:[function(require,module,exports){
angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
    return {
      createNew: function () {
        var stack = [];

        return {
          add: function (key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function (key) {
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function () {
            return stack[stack.length - 1];
          },
          remove: function (key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key == stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function () {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function () {
            return stack.length;
          }
        };
      }
    };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/modal/backdrop.html',
      link: function (scope, element, attrs) {
        scope.backdropClass = attrs.backdropClass || '';

        scope.animate = false;

        //trigger CSS transitions
        $timeout(function () {
          scope.animate = true;
        });
      }
    };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
    return {
      restrict: 'EA',
      scope: {
        index: '@',
        animate: '='
      },
      replace: true,
      transclude: true,
      templateUrl: function(tElement, tAttrs) {
        return tAttrs.templateUrl || 'template/modal/window.html';
      },
      link: function (scope, element, attrs) {
        element.addClass(attrs.windowClass || '');
        scope.size = attrs.size;

        $timeout(function () {
          // trigger CSS transitions
          scope.animate = true;

          /**
           * Auto-focusing of a freshly-opened modal element causes any child elements
           * with the autofocus attribute to lose focus. This is an issue on touch
           * based devices which will show and then hide the onscreen keyboard.
           * Attempts to refocus the autofocus element via JavaScript will not reopen
           * the onscreen keyboard. Fixed by updated the focusing logic to only autofocus
           * the modal element if the modal does not contain an autofocus element.
           */
          if (!element[0].querySelectorAll('[autofocus]').length) {
            element[0].focus();
          }
        });

        scope.close = function (evt) {
          var modal = $modalStack.getTop();
          if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
            evt.preventDefault();
            evt.stopPropagation();
            $modalStack.dismiss(modal.key, 'backdrop click');
          }
        };
      }
    };
  }])

  .directive('modalTransclude', function () {
    return {
      link: function($scope, $element, $attrs, controller, $transclude) {
        $transclude($scope.$parent, function(clone) {
          $element.empty();
          $element.append(clone);
        });
      }
    };
  })

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

      var OPENED_MODAL_CLASS = 'modal-open';

      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var $modalStack = {};

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }

      $rootScope.$watch(backdropIndex, function(newBackdropIndex){
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance) {

        var body = $document.find('body').eq(0);
        var modalWindow = openedWindows.get(modalInstance).value;

        //clean up the stack
        openedWindows.remove(modalInstance);

        //remove window DOM element
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, function() {
          modalWindow.modalScope.$destroy();
          body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
          checkRemoveBackdrop();
        });
      }

      function checkRemoveBackdrop() {
          //remove backdrop if no longer needed
          if (backdropDomEl && backdropIndex() == -1) {
            var backdropScopeRef = backdropScope;
            removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
              backdropScopeRef.$destroy();
              backdropScopeRef = null;
            });
            backdropDomEl = undefined;
            backdropScope = undefined;
          }
      }

      function removeAfterAnimate(domEl, scope, emulateTime, done) {
        // Closing animation
        scope.animate = false;

        var transitionEndEventName = $transition.transitionEndEventName;
        if (transitionEndEventName) {
          // transition out
          var timeout = $timeout(afterAnimating, emulateTime);

          domEl.bind(transitionEndEventName, function () {
            $timeout.cancel(timeout);
            afterAnimating();
            scope.$apply();
          });
        } else {
          // Ensure this call is async
          $timeout(afterAnimating);
        }

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;

          domEl.remove();
          if (done) {
            done();
          }
        }
      }

      $document.bind('keydown', function (evt) {
        var modal;

        if (evt.which === 27) {
          modal = openedWindows.top();
          if (modal && modal.value.keyboard) {
            evt.preventDefault();
            $rootScope.$apply(function () {
              $modalStack.dismiss(modal.key, 'escape key press');
            });
          }
        }
      });

      $modalStack.open = function (modalInstance, modal) {

        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard
        });

        var body = $document.find('body').eq(0),
            currBackdropIndex = backdropIndex();

        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.index = currBackdropIndex;
          var angularBackgroundDomEl = angular.element('<div modal-backdrop></div>');
          angularBackgroundDomEl.attr('backdrop-class', modal.backdropClass);
          backdropDomEl = $compile(angularBackgroundDomEl)(backdropScope);
          body.append(backdropDomEl);
        }

        var angularDomEl = angular.element('<div modal-window></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate'
        }).html(modal.content);

        var modalDomEl = $compile(angularDomEl)(modal.scope);
        openedWindows.top().value.modalDomEl = modalDomEl;
        body.append(modalDomEl);
        body.addClass(OPENED_MODAL_CLASS);
      };

      $modalStack.close = function (modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismiss = function (modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance);
        }
      };

      $modalStack.dismissAll = function (reason) {
        var topModal = this.getTop();
        while (topModal) {
          this.dismiss(topModal.key, reason);
          topModal = this.getTop();
        }
      };

      $modalStack.getTop = function () {
        return openedWindows.top();
      };

      return $modalStack;
    }])

  .provider('$modal', function () {

    var $modalProvider = {
      options: {
        backdrop: true, //can be also false or 'static'
        keyboard: true
      },
      $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
        function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $http.get(angular.isFunction(options.templateUrl) ? (options.templateUrl)() : options.templateUrl,
                {cache: $templateCache}).then(function (result) {
                  return result.data;
              });
          }

          function getResolvePromises(resolves) {
            var promisesArr = [];
            angular.forEach(resolves, function (value) {
              if (angular.isFunction(value) || angular.isArray(value)) {
                promisesArr.push($q.when($injector.invoke(value)));
              }
            });
            return promisesArr;
          }

          $modal.open = function (modalOptions) {

            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();

            //prepare an instance of a modal to be injected into controllers and returned to a caller
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              close: function (result) {
                $modalStack.close(modalInstance, result);
              },
              dismiss: function (reason) {
                $modalStack.dismiss(modalInstance, reason);
              }
            };

            //merge and clean up options
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};

            //verify options
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }

            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


            templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

              var modalScope = (modalOptions.scope || $rootScope).$new();
              modalScope.$close = modalInstance.close;
              modalScope.$dismiss = modalInstance.dismiss;

              var ctrlInstance, ctrlLocals = {};
              var resolveIter = 1;

              //controllers
              if (modalOptions.controller) {
                ctrlLocals.$scope = modalScope;
                ctrlLocals.$modalInstance = modalInstance;
                angular.forEach(modalOptions.resolve, function (value, key) {
                  ctrlLocals[key] = tplAndVars[resolveIter++];
                });

                ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                if (modalOptions.controllerAs) {
                  modalScope[modalOptions.controllerAs] = ctrlInstance;
                }
              }

              $modalStack.open(modalInstance, {
                scope: modalScope,
                deferred: modalResultDeferred,
                content: tplAndVars[0],
                backdrop: modalOptions.backdrop,
                keyboard: modalOptions.keyboard,
                backdropClass: modalOptions.backdropClass,
                windowClass: modalOptions.windowClass,
                windowTemplateUrl: modalOptions.windowTemplateUrl,
                size: modalOptions.size
              });

            }, function resolveError(reason) {
              modalResultDeferred.reject(reason);
            });

            templateAndResolvePromise.then(function () {
              modalOpenedDeferred.resolve(true);
            }, function () {
              modalOpenedDeferred.reject(false);
            });

            return modalInstance;
          };

          return $modal;
        }]
    };

    return $modalProvider;
  });

},{}],3:[function(require,module,exports){
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {

  var $transition = function(element, trigger, options) {
    options = options || {};
    var deferred = $q.defer();
    var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

    var transitionEndHandler = function(event) {
      $rootScope.$apply(function() {
        element.unbind(endEventName, transitionEndHandler);
        deferred.resolve(element);
      });
    };

    if (endEventName) {
      element.bind(endEventName, transitionEndHandler);
    }

    // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
    $timeout(function() {
      if ( angular.isString(trigger) ) {
        element.addClass(trigger);
      } else if ( angular.isFunction(trigger) ) {
        trigger(element);
      } else if ( angular.isObject(trigger) ) {
        element.css(trigger);
      }
      //If browser does not support transitions, instantly resolve
      if ( !endEventName ) {
        deferred.resolve(element);
      }
    });

    // Add our custom cancel function to the promise that is returned
    // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
    // i.e. it will therefore never raise a transitionEnd event for that transition
    deferred.promise.cancel = function() {
      if ( endEventName ) {
        element.unbind(endEventName, transitionEndHandler);
      }
      deferred.reject('Transition cancelled');
    };

    return deferred.promise;
  };

  // Work out the name of the transitionEnd event
  var transElement = document.createElement('trans');
  var transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'transition': 'transitionend'
  };
  var animationEndEventNames = {
    'WebkitTransition': 'webkitAnimationEnd',
    'MozTransition': 'animationend',
    'OTransition': 'oAnimationEnd',
    'transition': 'animationend'
  };
  function findEndEventName(endEventNames) {
    for (var name in endEventNames){
      if (transElement.style[name] !== undefined) {
        return endEventNames[name];
      }
    }
  }
  $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
  $transition.animationEndEventName = findEndEventName(animationEndEventNames);
  return $transition;
}]);

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

require('./states');
require('./controllers');
require('./services');
require('./interceptors')
require('./mocks');

},{"./controllers":4,"./interceptors":6,"./mocks":7,"./services":8,"./states":9}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
function Profile(Restangular) {
  return {
    getProfile: function () {
      return Restangular.one('/api/auth/me').get();
    }
  };
}

angular.module("moondash")
  .factory('MdProfile', Profile);

},{}],9:[function(require,module,exports){
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
                 templateUrl: '/auth/login.partial.html',
                 controller: 'LoginCtrl as ctrl'
               }
             }
           })
    .state('auth.logout', {
             url: '/logout',
             views: {
               'md-content@root': {
                 controller: 'LogoutCtrl as ctrl',
                 templateUrl: '/auth/logout.partial.html'
               }
             }
           })
    .state('auth.profile', {
             url: '/profile',
             //authenticate: true,
             views: {
               'md-content@root': {
                 templateUrl: '/auth/profile.partial.html',
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
},{}],10:[function(require,module,exports){
'use strict';

require('./services');


},{"./services":11}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

require('./states');

},{"./states":13}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
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
}

angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');
require('./services');

},{"./controllers":14,"./services":16,"./states":17}],16:[function(require,module,exports){
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
             templateUrl: '/layout/md-layout.partial.html',
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
                 templateUrl: '/layout/md-header.partial.html',
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-sectionsmenu': {
                 templateUrl: '/layout/md-sectionsmenu.partial.html',
                 controller: 'SectionsCtrl as ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 templateUrl: '/layout/md-footer.partial.html'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL2FuZ3VsYXItYm9vdHN0cmFwL3NyYy9tb2RhbC9tb2RhbC5qcyIsIm5vZGVfbW9kdWxlcy9hbmd1bGFyLWJvb3RzdHJhcC9zcmMvdHJhbnNpdGlvbi90cmFuc2l0aW9uLmpzIiwic3JjL2F1dGgvY29udHJvbGxlcnMuanMiLCJzcmMvYXV0aC9pbmRleC5qcyIsInNyYy9hdXRoL2ludGVyY2VwdG9ycy5qcyIsInNyYy9hdXRoL21vY2tzLmpzIiwic3JjL2F1dGgvc2VydmljZXMuanMiLCJzcmMvYXV0aC9zdGF0ZXMuanMiLCJzcmMvY29uZmlndXJhdG9yL2luZGV4LmpzIiwic3JjL2NvbmZpZ3VyYXRvci9zZXJ2aWNlcy5qcyIsInNyYy9nbG9iYWxzZWN0aW9uL2luZGV4LmpzIiwic3JjL2dsb2JhbHNlY3Rpb24vc3RhdGVzLmpzIiwic3JjL2xheW91dC9jb250cm9sbGVycy5qcyIsInNyYy9sYXlvdXQvaW5kZXguanMiLCJzcmMvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2xheW91dC9zdGF0ZXMuanMiLCJzcmMvbW9ja2FwaS9pbmRleC5qcyIsInNyYy9tb2NrYXBpL3Byb3ZpZGVycy5qcyIsInNyYy9ub3RpY2UvY29udHJvbGxlcnMuanMiLCJzcmMvbm90aWNlL2luZGV4LmpzIiwic3JjL25vdGljZS9zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9aQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuXG4gRGVjbGFyZSB0aGUgbW9kdWxlIHdpdGggZGVwZW5kZW5jaWVzLCBhbmQgbm90aGluZyBtb3JlLlxuXG4gSWYgcnVubmluZyBpbiBcImRldmVsb3BtZW50IG1vZGVcIiwgaW5qZWN0IHRoZSBtb2NrIGluZnJhc3RydWN0dXJlLlxuXG4gKi9cblxuLypcblRPRE8gVGhpcyBuZWVkcyB0byBiZSBwdXQgaW4gYnJvd3NlcmlmeSB0byBnZXQgaW50byBtb29uZGFzaC12ZW5kb3JzXG5pbnN0ZWFkIG9mIG1vb25kYXNoLmpzLiBCdXQgaXQncyBjb21wbGljYXRlZDpcbi0gYW5ndWxhci1ib290c3RyYXAgcHJvdmlkZXMgYW4gbnBtIHBhY2thZ2Vcbi0gQnV0IHRoYXQgcGFja2FnaW5nIGRvZXMgbm90IGluY2x1ZGUgY29uY2F0ZW5hdGVkIHZlcnNpb24gb2Ygc3VibW9kdWxlc1xuLSBJIGNhbid0IGZpZ3VyZSBvdXQgdGhlIHJpZ2h0IG5hbWVzcGFjZXMgdG8gcHV0IGludG8gdGhlIGJyb3dzZXIgZmllbGRcbiAqL1xucmVxdWlyZSgnYW5ndWxhci1ib290c3RyYXAvc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbicpO1xucmVxdWlyZSgnYW5ndWxhci1ib290c3RyYXAvc3JjL21vZGFsL21vZGFsJyk7XG5cbnZhciBkZXBlbmRlbmNpZXMgPSBbJ3VpLnJvdXRlcicsICdyZXN0YW5ndWxhcicsICdzYXRlbGxpemVyJyxcbiAgJ3VpLmJvb3RzdHJhcC5tb2RhbCddO1xuXG4vLyBJZiBuZ01vY2sgaXMgbG9hZGVkLCBpdCB0YWtlcyBvdmVyIHRoZSBiYWNrZW5kLiBXZSBzaG91bGQgb25seSBhZGRcbi8vIGl0IHRvIHRoZSBsaXN0IG9mIG1vZHVsZSBkZXBlbmRlbmNpZXMgaWYgd2UgYXJlIGluIFwiZnJvbnRlbmQgbW9ja1wiXG4vLyBtb2RlLiBGbGFnIHRoaXMgYnkgcHV0dGluZyB0aGUgY2xhc3MgLmZyb250ZW5kTW9jayBvbiBzb21lIGVsZW1lbnRcbi8vIGluIHRoZSBkZW1vIC5odG1sIHBhZ2UuXG52YXIgbW9ja0FwaSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tb2NrQXBpJyk7XG5pZiAobW9ja0FwaSkge1xuICBkZXBlbmRlbmNpZXMucHVzaCgnbmdNb2NrRTJFJyk7XG4gIGRlcGVuZGVuY2llcy5wdXNoKCdtb29uZGFzaE1vY2snKTtcbn1cblxudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnLCBkZXBlbmRlbmNpZXMpO1xuXG4vLyBOb3cgdGhlIE1vb25kYXNoIGNvbXBvbmVudHNcbnJlcXVpcmUoJy4vbGF5b3V0Jyk7XG5yZXF1aXJlKCcuL2dsb2JhbHNlY3Rpb24nKTtcbnJlcXVpcmUoJy4vY29uZmlndXJhdG9yJyk7XG5yZXF1aXJlKCcuL21vY2thcGknKTtcbnJlcXVpcmUoJy4vYXV0aCcpO1xucmVxdWlyZSgnLi9ub3RpY2UnKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC5tb2RhbCcsIFsndWkuYm9vdHN0cmFwLnRyYW5zaXRpb24nXSlcblxuLyoqXG4gKiBBIGhlbHBlciwgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBhY3RzIGFzIGEgbWFwIGJ1dCBhbHNvIGFsbG93cyBnZXR0aW5nIC8gcmVtb3ZpbmdcbiAqIGVsZW1lbnRzIGluIHRoZSBMSUZPIG9yZGVyXG4gKi9cbiAgLmZhY3RvcnkoJyQkc3RhY2tlZE1hcCcsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3JlYXRlTmV3OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdGFjayA9IFtdO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYWRkOiBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3RhY2sucHVzaCh7XG4gICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChrZXkgPT0gc3RhY2tbaV0ua2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrW2ldO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGtleXMucHVzaChzdGFja1tpXS5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICB0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZTogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGlkeCA9IC0xO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoa2V5ID09IHN0YWNrW2ldLmtleSkge1xuICAgICAgICAgICAgICAgIGlkeCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGFjay5zcGxpY2UoaWR4LCAxKVswXTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbW92ZVRvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLnNwbGljZShzdGFjay5sZW5ndGggLSAxLCAxKVswXTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YWNrLmxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfSlcblxuLyoqXG4gKiBBIGhlbHBlciBkaXJlY3RpdmUgZm9yIHRoZSAkbW9kYWwgc2VydmljZS4gSXQgY3JlYXRlcyBhIGJhY2tkcm9wIGVsZW1lbnQuXG4gKi9cbiAgLmRpcmVjdGl2ZSgnbW9kYWxCYWNrZHJvcCcsIFsnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZS9tb2RhbC9iYWNrZHJvcC5odG1sJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgc2NvcGUuYmFja2Ryb3BDbGFzcyA9IGF0dHJzLmJhY2tkcm9wQ2xhc3MgfHwgJyc7XG5cbiAgICAgICAgc2NvcGUuYW5pbWF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vdHJpZ2dlciBDU1MgdHJhbnNpdGlvbnNcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNjb3BlLmFuaW1hdGUgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSlcblxuICAuZGlyZWN0aXZlKCdtb2RhbFdpbmRvdycsIFsnJG1vZGFsU3RhY2snLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJG1vZGFsU3RhY2ssICR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgaW5kZXg6ICdAJyxcbiAgICAgICAgYW5pbWF0ZTogJz0nXG4gICAgICB9LFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogZnVuY3Rpb24odEVsZW1lbnQsIHRBdHRycykge1xuICAgICAgICByZXR1cm4gdEF0dHJzLnRlbXBsYXRlVXJsIHx8ICd0ZW1wbGF0ZS9tb2RhbC93aW5kb3cuaHRtbCc7XG4gICAgICB9LFxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICBlbGVtZW50LmFkZENsYXNzKGF0dHJzLndpbmRvd0NsYXNzIHx8ICcnKTtcbiAgICAgICAgc2NvcGUuc2l6ZSA9IGF0dHJzLnNpemU7XG5cbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIHRyaWdnZXIgQ1NTIHRyYW5zaXRpb25zXG4gICAgICAgICAgc2NvcGUuYW5pbWF0ZSA9IHRydWU7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBBdXRvLWZvY3VzaW5nIG9mIGEgZnJlc2hseS1vcGVuZWQgbW9kYWwgZWxlbWVudCBjYXVzZXMgYW55IGNoaWxkIGVsZW1lbnRzXG4gICAgICAgICAgICogd2l0aCB0aGUgYXV0b2ZvY3VzIGF0dHJpYnV0ZSB0byBsb3NlIGZvY3VzLiBUaGlzIGlzIGFuIGlzc3VlIG9uIHRvdWNoXG4gICAgICAgICAgICogYmFzZWQgZGV2aWNlcyB3aGljaCB3aWxsIHNob3cgYW5kIHRoZW4gaGlkZSB0aGUgb25zY3JlZW4ga2V5Ym9hcmQuXG4gICAgICAgICAgICogQXR0ZW1wdHMgdG8gcmVmb2N1cyB0aGUgYXV0b2ZvY3VzIGVsZW1lbnQgdmlhIEphdmFTY3JpcHQgd2lsbCBub3QgcmVvcGVuXG4gICAgICAgICAgICogdGhlIG9uc2NyZWVuIGtleWJvYXJkLiBGaXhlZCBieSB1cGRhdGVkIHRoZSBmb2N1c2luZyBsb2dpYyB0byBvbmx5IGF1dG9mb2N1c1xuICAgICAgICAgICAqIHRoZSBtb2RhbCBlbGVtZW50IGlmIHRoZSBtb2RhbCBkb2VzIG5vdCBjb250YWluIGFuIGF1dG9mb2N1cyBlbGVtZW50LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGlmICghZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yQWxsKCdbYXV0b2ZvY3VzXScpLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbWVudFswXS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NvcGUuY2xvc2UgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgdmFyIG1vZGFsID0gJG1vZGFsU3RhY2suZ2V0VG9wKCk7XG4gICAgICAgICAgaWYgKG1vZGFsICYmIG1vZGFsLnZhbHVlLmJhY2tkcm9wICYmIG1vZGFsLnZhbHVlLmJhY2tkcm9wICE9ICdzdGF0aWMnICYmIChldnQudGFyZ2V0ID09PSBldnQuY3VycmVudFRhcmdldCkpIHtcbiAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdiYWNrZHJvcCBjbGljaycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSlcblxuICAuZGlyZWN0aXZlKCdtb2RhbFRyYW5zY2x1ZGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgY29udHJvbGxlciwgJHRyYW5zY2x1ZGUpIHtcbiAgICAgICAgJHRyYW5zY2x1ZGUoJHNjb3BlLiRwYXJlbnQsIGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgICAgICAgJGVsZW1lbnQuZW1wdHkoKTtcbiAgICAgICAgICAkZWxlbWVudC5hcHBlbmQoY2xvbmUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KVxuXG4gIC5mYWN0b3J5KCckbW9kYWxTdGFjaycsIFsnJHRyYW5zaXRpb24nLCAnJHRpbWVvdXQnLCAnJGRvY3VtZW50JywgJyRjb21waWxlJywgJyRyb290U2NvcGUnLCAnJCRzdGFja2VkTWFwJyxcbiAgICBmdW5jdGlvbiAoJHRyYW5zaXRpb24sICR0aW1lb3V0LCAkZG9jdW1lbnQsICRjb21waWxlLCAkcm9vdFNjb3BlLCAkJHN0YWNrZWRNYXApIHtcblxuICAgICAgdmFyIE9QRU5FRF9NT0RBTF9DTEFTUyA9ICdtb2RhbC1vcGVuJztcblxuICAgICAgdmFyIGJhY2tkcm9wRG9tRWwsIGJhY2tkcm9wU2NvcGU7XG4gICAgICB2YXIgb3BlbmVkV2luZG93cyA9ICQkc3RhY2tlZE1hcC5jcmVhdGVOZXcoKTtcbiAgICAgIHZhciAkbW9kYWxTdGFjayA9IHt9O1xuXG4gICAgICBmdW5jdGlvbiBiYWNrZHJvcEluZGV4KCkge1xuICAgICAgICB2YXIgdG9wQmFja2Ryb3BJbmRleCA9IC0xO1xuICAgICAgICB2YXIgb3BlbmVkID0gb3BlbmVkV2luZG93cy5rZXlzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3BlbmVkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKG9wZW5lZFdpbmRvd3MuZ2V0KG9wZW5lZFtpXSkudmFsdWUuYmFja2Ryb3ApIHtcbiAgICAgICAgICAgIHRvcEJhY2tkcm9wSW5kZXggPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9wQmFja2Ryb3BJbmRleDtcbiAgICAgIH1cblxuICAgICAgJHJvb3RTY29wZS4kd2F0Y2goYmFja2Ryb3BJbmRleCwgZnVuY3Rpb24obmV3QmFja2Ryb3BJbmRleCl7XG4gICAgICAgIGlmIChiYWNrZHJvcFNjb3BlKSB7XG4gICAgICAgICAgYmFja2Ryb3BTY29wZS5pbmRleCA9IG5ld0JhY2tkcm9wSW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlKSB7XG5cbiAgICAgICAgdmFyIGJvZHkgPSAkZG9jdW1lbnQuZmluZCgnYm9keScpLmVxKDApO1xuICAgICAgICB2YXIgbW9kYWxXaW5kb3cgPSBvcGVuZWRXaW5kb3dzLmdldChtb2RhbEluc3RhbmNlKS52YWx1ZTtcblxuICAgICAgICAvL2NsZWFuIHVwIHRoZSBzdGFja1xuICAgICAgICBvcGVuZWRXaW5kb3dzLnJlbW92ZShtb2RhbEluc3RhbmNlKTtcblxuICAgICAgICAvL3JlbW92ZSB3aW5kb3cgRE9NIGVsZW1lbnRcbiAgICAgICAgcmVtb3ZlQWZ0ZXJBbmltYXRlKG1vZGFsV2luZG93Lm1vZGFsRG9tRWwsIG1vZGFsV2luZG93Lm1vZGFsU2NvcGUsIDMwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbW9kYWxXaW5kb3cubW9kYWxTY29wZS4kZGVzdHJveSgpO1xuICAgICAgICAgIGJvZHkudG9nZ2xlQ2xhc3MoT1BFTkVEX01PREFMX0NMQVNTLCBvcGVuZWRXaW5kb3dzLmxlbmd0aCgpID4gMCk7XG4gICAgICAgICAgY2hlY2tSZW1vdmVCYWNrZHJvcCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2hlY2tSZW1vdmVCYWNrZHJvcCgpIHtcbiAgICAgICAgICAvL3JlbW92ZSBiYWNrZHJvcCBpZiBubyBsb25nZXIgbmVlZGVkXG4gICAgICAgICAgaWYgKGJhY2tkcm9wRG9tRWwgJiYgYmFja2Ryb3BJbmRleCgpID09IC0xKSB7XG4gICAgICAgICAgICB2YXIgYmFja2Ryb3BTY29wZVJlZiA9IGJhY2tkcm9wU2NvcGU7XG4gICAgICAgICAgICByZW1vdmVBZnRlckFuaW1hdGUoYmFja2Ryb3BEb21FbCwgYmFja2Ryb3BTY29wZSwgMTUwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGJhY2tkcm9wU2NvcGVSZWYuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgYmFja2Ryb3BTY29wZVJlZiA9IG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhY2tkcm9wRG9tRWwgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBiYWNrZHJvcFNjb3BlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQWZ0ZXJBbmltYXRlKGRvbUVsLCBzY29wZSwgZW11bGF0ZVRpbWUsIGRvbmUpIHtcbiAgICAgICAgLy8gQ2xvc2luZyBhbmltYXRpb25cbiAgICAgICAgc2NvcGUuYW5pbWF0ZSA9IGZhbHNlO1xuXG4gICAgICAgIHZhciB0cmFuc2l0aW9uRW5kRXZlbnROYW1lID0gJHRyYW5zaXRpb24udHJhbnNpdGlvbkVuZEV2ZW50TmFtZTtcbiAgICAgICAgaWYgKHRyYW5zaXRpb25FbmRFdmVudE5hbWUpIHtcbiAgICAgICAgICAvLyB0cmFuc2l0aW9uIG91dFxuICAgICAgICAgIHZhciB0aW1lb3V0ID0gJHRpbWVvdXQoYWZ0ZXJBbmltYXRpbmcsIGVtdWxhdGVUaW1lKTtcblxuICAgICAgICAgIGRvbUVsLmJpbmQodHJhbnNpdGlvbkVuZEV2ZW50TmFtZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVvdXQpO1xuICAgICAgICAgICAgYWZ0ZXJBbmltYXRpbmcoKTtcbiAgICAgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIEVuc3VyZSB0aGlzIGNhbGwgaXMgYXN5bmNcbiAgICAgICAgICAkdGltZW91dChhZnRlckFuaW1hdGluZyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZnRlckFuaW1hdGluZygpIHtcbiAgICAgICAgICBpZiAoYWZ0ZXJBbmltYXRpbmcuZG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhZnRlckFuaW1hdGluZy5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIGRvbUVsLnJlbW92ZSgpO1xuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRkb2N1bWVudC5iaW5kKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICB2YXIgbW9kYWw7XG5cbiAgICAgICAgaWYgKGV2dC53aGljaCA9PT0gMjcpIHtcbiAgICAgICAgICBtb2RhbCA9IG9wZW5lZFdpbmRvd3MudG9wKCk7XG4gICAgICAgICAgaWYgKG1vZGFsICYmIG1vZGFsLnZhbHVlLmtleWJvYXJkKSB7XG4gICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbC5rZXksICdlc2NhcGUga2V5IHByZXNzJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAkbW9kYWxTdGFjay5vcGVuID0gZnVuY3Rpb24gKG1vZGFsSW5zdGFuY2UsIG1vZGFsKSB7XG5cbiAgICAgICAgb3BlbmVkV2luZG93cy5hZGQobW9kYWxJbnN0YW5jZSwge1xuICAgICAgICAgIGRlZmVycmVkOiBtb2RhbC5kZWZlcnJlZCxcbiAgICAgICAgICBtb2RhbFNjb3BlOiBtb2RhbC5zY29wZSxcbiAgICAgICAgICBiYWNrZHJvcDogbW9kYWwuYmFja2Ryb3AsXG4gICAgICAgICAga2V5Ym9hcmQ6IG1vZGFsLmtleWJvYXJkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBib2R5ID0gJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5lcSgwKSxcbiAgICAgICAgICAgIGN1cnJCYWNrZHJvcEluZGV4ID0gYmFja2Ryb3BJbmRleCgpO1xuXG4gICAgICAgIGlmIChjdXJyQmFja2Ryb3BJbmRleCA+PSAwICYmICFiYWNrZHJvcERvbUVsKSB7XG4gICAgICAgICAgYmFja2Ryb3BTY29wZSA9ICRyb290U2NvcGUuJG5ldyh0cnVlKTtcbiAgICAgICAgICBiYWNrZHJvcFNjb3BlLmluZGV4ID0gY3VyckJhY2tkcm9wSW5kZXg7XG4gICAgICAgICAgdmFyIGFuZ3VsYXJCYWNrZ3JvdW5kRG9tRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgbW9kYWwtYmFja2Ryb3A+PC9kaXY+Jyk7XG4gICAgICAgICAgYW5ndWxhckJhY2tncm91bmREb21FbC5hdHRyKCdiYWNrZHJvcC1jbGFzcycsIG1vZGFsLmJhY2tkcm9wQ2xhc3MpO1xuICAgICAgICAgIGJhY2tkcm9wRG9tRWwgPSAkY29tcGlsZShhbmd1bGFyQmFja2dyb3VuZERvbUVsKShiYWNrZHJvcFNjb3BlKTtcbiAgICAgICAgICBib2R5LmFwcGVuZChiYWNrZHJvcERvbUVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhbmd1bGFyRG9tRWwgPSBhbmd1bGFyLmVsZW1lbnQoJzxkaXYgbW9kYWwtd2luZG93PjwvZGl2PicpO1xuICAgICAgICBhbmd1bGFyRG9tRWwuYXR0cih7XG4gICAgICAgICAgJ3RlbXBsYXRlLXVybCc6IG1vZGFsLndpbmRvd1RlbXBsYXRlVXJsLFxuICAgICAgICAgICd3aW5kb3ctY2xhc3MnOiBtb2RhbC53aW5kb3dDbGFzcyxcbiAgICAgICAgICAnc2l6ZSc6IG1vZGFsLnNpemUsXG4gICAgICAgICAgJ2luZGV4Jzogb3BlbmVkV2luZG93cy5sZW5ndGgoKSAtIDEsXG4gICAgICAgICAgJ2FuaW1hdGUnOiAnYW5pbWF0ZSdcbiAgICAgICAgfSkuaHRtbChtb2RhbC5jb250ZW50KTtcblxuICAgICAgICB2YXIgbW9kYWxEb21FbCA9ICRjb21waWxlKGFuZ3VsYXJEb21FbCkobW9kYWwuc2NvcGUpO1xuICAgICAgICBvcGVuZWRXaW5kb3dzLnRvcCgpLnZhbHVlLm1vZGFsRG9tRWwgPSBtb2RhbERvbUVsO1xuICAgICAgICBib2R5LmFwcGVuZChtb2RhbERvbUVsKTtcbiAgICAgICAgYm9keS5hZGRDbGFzcyhPUEVORURfTU9EQUxfQ0xBU1MpO1xuICAgICAgfTtcblxuICAgICAgJG1vZGFsU3RhY2suY2xvc2UgPSBmdW5jdGlvbiAobW9kYWxJbnN0YW5jZSwgcmVzdWx0KSB7XG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xuICAgICAgICBpZiAobW9kYWxXaW5kb3cpIHtcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5kZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgcmVtb3ZlTW9kYWxXaW5kb3cobW9kYWxJbnN0YW5jZSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRtb2RhbFN0YWNrLmRpc21pc3MgPSBmdW5jdGlvbiAobW9kYWxJbnN0YW5jZSwgcmVhc29uKSB7XG4gICAgICAgIHZhciBtb2RhbFdpbmRvdyA9IG9wZW5lZFdpbmRvd3MuZ2V0KG1vZGFsSW5zdGFuY2UpO1xuICAgICAgICBpZiAobW9kYWxXaW5kb3cpIHtcbiAgICAgICAgICBtb2RhbFdpbmRvdy52YWx1ZS5kZWZlcnJlZC5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICByZW1vdmVNb2RhbFdpbmRvdyhtb2RhbEluc3RhbmNlKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgJG1vZGFsU3RhY2suZGlzbWlzc0FsbCA9IGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdmFyIHRvcE1vZGFsID0gdGhpcy5nZXRUb3AoKTtcbiAgICAgICAgd2hpbGUgKHRvcE1vZGFsKSB7XG4gICAgICAgICAgdGhpcy5kaXNtaXNzKHRvcE1vZGFsLmtleSwgcmVhc29uKTtcbiAgICAgICAgICB0b3BNb2RhbCA9IHRoaXMuZ2V0VG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRtb2RhbFN0YWNrLmdldFRvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG9wZW5lZFdpbmRvd3MudG9wKCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gJG1vZGFsU3RhY2s7XG4gICAgfV0pXG5cbiAgLnByb3ZpZGVyKCckbW9kYWwnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgJG1vZGFsUHJvdmlkZXIgPSB7XG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGJhY2tkcm9wOiB0cnVlLCAvL2NhbiBiZSBhbHNvIGZhbHNlIG9yICdzdGF0aWMnXG4gICAgICAgIGtleWJvYXJkOiB0cnVlXG4gICAgICB9LFxuICAgICAgJGdldDogWyckaW5qZWN0b3InLCAnJHJvb3RTY29wZScsICckcScsICckaHR0cCcsICckdGVtcGxhdGVDYWNoZScsICckY29udHJvbGxlcicsICckbW9kYWxTdGFjaycsXG4gICAgICAgIGZ1bmN0aW9uICgkaW5qZWN0b3IsICRyb290U2NvcGUsICRxLCAkaHR0cCwgJHRlbXBsYXRlQ2FjaGUsICRjb250cm9sbGVyLCAkbW9kYWxTdGFjaykge1xuXG4gICAgICAgICAgdmFyICRtb2RhbCA9IHt9O1xuXG4gICAgICAgICAgZnVuY3Rpb24gZ2V0VGVtcGxhdGVQcm9taXNlKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLnRlbXBsYXRlID8gJHEud2hlbihvcHRpb25zLnRlbXBsYXRlKSA6XG4gICAgICAgICAgICAgICRodHRwLmdldChhbmd1bGFyLmlzRnVuY3Rpb24ob3B0aW9ucy50ZW1wbGF0ZVVybCkgPyAob3B0aW9ucy50ZW1wbGF0ZVVybCkoKSA6IG9wdGlvbnMudGVtcGxhdGVVcmwsXG4gICAgICAgICAgICAgICAge2NhY2hlOiAkdGVtcGxhdGVDYWNoZX0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmdW5jdGlvbiBnZXRSZXNvbHZlUHJvbWlzZXMocmVzb2x2ZXMpIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlc0FyciA9IFtdO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlc29sdmVzLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih2YWx1ZSkgfHwgYW5ndWxhci5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHByb21pc2VzQXJyLnB1c2goJHEud2hlbigkaW5qZWN0b3IuaW52b2tlKHZhbHVlKSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlc0FycjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAkbW9kYWwub3BlbiA9IGZ1bmN0aW9uIChtb2RhbE9wdGlvbnMpIHtcblxuICAgICAgICAgICAgdmFyIG1vZGFsUmVzdWx0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIG1vZGFsT3BlbmVkRGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgICAgICAvL3ByZXBhcmUgYW4gaW5zdGFuY2Ugb2YgYSBtb2RhbCB0byBiZSBpbmplY3RlZCBpbnRvIGNvbnRyb2xsZXJzIGFuZCByZXR1cm5lZCB0byBhIGNhbGxlclxuICAgICAgICAgICAgdmFyIG1vZGFsSW5zdGFuY2UgPSB7XG4gICAgICAgICAgICAgIHJlc3VsdDogbW9kYWxSZXN1bHREZWZlcnJlZC5wcm9taXNlLFxuICAgICAgICAgICAgICBvcGVuZWQ6IG1vZGFsT3BlbmVkRGVmZXJyZWQucHJvbWlzZSxcbiAgICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAkbW9kYWxTdGFjay5jbG9zZShtb2RhbEluc3RhbmNlLCByZXN1bHQpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkaXNtaXNzOiBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgJG1vZGFsU3RhY2suZGlzbWlzcyhtb2RhbEluc3RhbmNlLCByZWFzb24pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvL21lcmdlIGFuZCBjbGVhbiB1cCBvcHRpb25zXG4gICAgICAgICAgICBtb2RhbE9wdGlvbnMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgJG1vZGFsUHJvdmlkZXIub3B0aW9ucywgbW9kYWxPcHRpb25zKTtcbiAgICAgICAgICAgIG1vZGFsT3B0aW9ucy5yZXNvbHZlID0gbW9kYWxPcHRpb25zLnJlc29sdmUgfHwge307XG5cbiAgICAgICAgICAgIC8vdmVyaWZ5IG9wdGlvbnNcbiAgICAgICAgICAgIGlmICghbW9kYWxPcHRpb25zLnRlbXBsYXRlICYmICFtb2RhbE9wdGlvbnMudGVtcGxhdGVVcmwpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmUgb2YgdGVtcGxhdGUgb3IgdGVtcGxhdGVVcmwgb3B0aW9ucyBpcyByZXF1aXJlZC4nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UgPVxuICAgICAgICAgICAgICAkcS5hbGwoW2dldFRlbXBsYXRlUHJvbWlzZShtb2RhbE9wdGlvbnMpXS5jb25jYXQoZ2V0UmVzb2x2ZVByb21pc2VzKG1vZGFsT3B0aW9ucy5yZXNvbHZlKSkpO1xuXG5cbiAgICAgICAgICAgIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UudGhlbihmdW5jdGlvbiByZXNvbHZlU3VjY2Vzcyh0cGxBbmRWYXJzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIG1vZGFsU2NvcGUgPSAobW9kYWxPcHRpb25zLnNjb3BlIHx8ICRyb290U2NvcGUpLiRuZXcoKTtcbiAgICAgICAgICAgICAgbW9kYWxTY29wZS4kY2xvc2UgPSBtb2RhbEluc3RhbmNlLmNsb3NlO1xuICAgICAgICAgICAgICBtb2RhbFNjb3BlLiRkaXNtaXNzID0gbW9kYWxJbnN0YW5jZS5kaXNtaXNzO1xuXG4gICAgICAgICAgICAgIHZhciBjdHJsSW5zdGFuY2UsIGN0cmxMb2NhbHMgPSB7fTtcbiAgICAgICAgICAgICAgdmFyIHJlc29sdmVJdGVyID0gMTtcblxuICAgICAgICAgICAgICAvL2NvbnRyb2xsZXJzXG4gICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgIGN0cmxMb2NhbHMuJHNjb3BlID0gbW9kYWxTY29wZTtcbiAgICAgICAgICAgICAgICBjdHJsTG9jYWxzLiRtb2RhbEluc3RhbmNlID0gbW9kYWxJbnN0YW5jZTtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobW9kYWxPcHRpb25zLnJlc29sdmUsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgICAgICBjdHJsTG9jYWxzW2tleV0gPSB0cGxBbmRWYXJzW3Jlc29sdmVJdGVyKytdO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY3RybEluc3RhbmNlID0gJGNvbnRyb2xsZXIobW9kYWxPcHRpb25zLmNvbnRyb2xsZXIsIGN0cmxMb2NhbHMpO1xuICAgICAgICAgICAgICAgIGlmIChtb2RhbE9wdGlvbnMuY29udHJvbGxlckFzKSB7XG4gICAgICAgICAgICAgICAgICBtb2RhbFNjb3BlW21vZGFsT3B0aW9ucy5jb250cm9sbGVyQXNdID0gY3RybEluc3RhbmNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICRtb2RhbFN0YWNrLm9wZW4obW9kYWxJbnN0YW5jZSwge1xuICAgICAgICAgICAgICAgIHNjb3BlOiBtb2RhbFNjb3BlLFxuICAgICAgICAgICAgICAgIGRlZmVycmVkOiBtb2RhbFJlc3VsdERlZmVycmVkLFxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHRwbEFuZFZhcnNbMF0sXG4gICAgICAgICAgICAgICAgYmFja2Ryb3A6IG1vZGFsT3B0aW9ucy5iYWNrZHJvcCxcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogbW9kYWxPcHRpb25zLmtleWJvYXJkLFxuICAgICAgICAgICAgICAgIGJhY2tkcm9wQ2xhc3M6IG1vZGFsT3B0aW9ucy5iYWNrZHJvcENsYXNzLFxuICAgICAgICAgICAgICAgIHdpbmRvd0NsYXNzOiBtb2RhbE9wdGlvbnMud2luZG93Q2xhc3MsXG4gICAgICAgICAgICAgICAgd2luZG93VGVtcGxhdGVVcmw6IG1vZGFsT3B0aW9ucy53aW5kb3dUZW1wbGF0ZVVybCxcbiAgICAgICAgICAgICAgICBzaXplOiBtb2RhbE9wdGlvbnMuc2l6ZVxuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gcmVzb2x2ZUVycm9yKHJlYXNvbikge1xuICAgICAgICAgICAgICBtb2RhbFJlc3VsdERlZmVycmVkLnJlamVjdChyZWFzb24pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRlbXBsYXRlQW5kUmVzb2x2ZVByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIG1vZGFsT3BlbmVkRGVmZXJyZWQucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgbW9kYWxPcGVuZWREZWZlcnJlZC5yZWplY3QoZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBtb2RhbEluc3RhbmNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICByZXR1cm4gJG1vZGFsO1xuICAgICAgICB9XVxuICAgIH07XG5cbiAgICByZXR1cm4gJG1vZGFsUHJvdmlkZXI7XG4gIH0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ3VpLmJvb3RzdHJhcC50cmFuc2l0aW9uJywgW10pXG5cbi8qKlxuICogJHRyYW5zaXRpb24gc2VydmljZSBwcm92aWRlcyBhIGNvbnNpc3RlbnQgaW50ZXJmYWNlIHRvIHRyaWdnZXIgQ1NTIDMgdHJhbnNpdGlvbnMgYW5kIHRvIGJlIGluZm9ybWVkIHdoZW4gdGhleSBjb21wbGV0ZS5cbiAqIEBwYXJhbSAge0RPTUVsZW1lbnR9IGVsZW1lbnQgIFRoZSBET01FbGVtZW50IHRoYXQgd2lsbCBiZSBhbmltYXRlZC5cbiAqIEBwYXJhbSAge3N0cmluZ3xvYmplY3R8ZnVuY3Rpb259IHRyaWdnZXIgIFRoZSB0aGluZyB0aGF0IHdpbGwgY2F1c2UgdGhlIHRyYW5zaXRpb24gdG8gc3RhcnQ6XG4gKiAgIC0gQXMgYSBzdHJpbmcsIGl0IHJlcHJlc2VudHMgdGhlIGNzcyBjbGFzcyB0byBiZSBhZGRlZCB0byB0aGUgZWxlbWVudC5cbiAqICAgLSBBcyBhbiBvYmplY3QsIGl0IHJlcHJlc2VudHMgYSBoYXNoIG9mIHN0eWxlIGF0dHJpYnV0ZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgZWxlbWVudC5cbiAqICAgLSBBcyBhIGZ1bmN0aW9uLCBpdCByZXByZXNlbnRzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHRoYXQgd2lsbCBjYXVzZSB0aGUgdHJhbnNpdGlvbiB0byBvY2N1ci5cbiAqIEByZXR1cm4ge1Byb21pc2V9ICBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSB0cmFuc2l0aW9uIGZpbmlzaGVzLlxuICovXG4uZmFjdG9yeSgnJHRyYW5zaXRpb24nLCBbJyRxJywgJyR0aW1lb3V0JywgJyRyb290U2NvcGUnLCBmdW5jdGlvbigkcSwgJHRpbWVvdXQsICRyb290U2NvcGUpIHtcblxuICB2YXIgJHRyYW5zaXRpb24gPSBmdW5jdGlvbihlbGVtZW50LCB0cmlnZ2VyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgZW5kRXZlbnROYW1lID0gJHRyYW5zaXRpb25bb3B0aW9ucy5hbmltYXRpb24gPyAnYW5pbWF0aW9uRW5kRXZlbnROYW1lJyA6ICd0cmFuc2l0aW9uRW5kRXZlbnROYW1lJ107XG5cbiAgICB2YXIgdHJhbnNpdGlvbkVuZEhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGVsZW1lbnQudW5iaW5kKGVuZEV2ZW50TmFtZSwgdHJhbnNpdGlvbkVuZEhhbmRsZXIpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGlmIChlbmRFdmVudE5hbWUpIHtcbiAgICAgIGVsZW1lbnQuYmluZChlbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmRIYW5kbGVyKTtcbiAgICB9XG5cbiAgICAvLyBXcmFwIGluIGEgdGltZW91dCB0byBhbGxvdyB0aGUgYnJvd3NlciB0aW1lIHRvIHVwZGF0ZSB0aGUgRE9NIGJlZm9yZSB0aGUgdHJhbnNpdGlvbiBpcyB0byBvY2N1clxuICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCBhbmd1bGFyLmlzU3RyaW5nKHRyaWdnZXIpICkge1xuICAgICAgICBlbGVtZW50LmFkZENsYXNzKHRyaWdnZXIpO1xuICAgICAgfSBlbHNlIGlmICggYW5ndWxhci5pc0Z1bmN0aW9uKHRyaWdnZXIpICkge1xuICAgICAgICB0cmlnZ2VyKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIGlmICggYW5ndWxhci5pc09iamVjdCh0cmlnZ2VyKSApIHtcbiAgICAgICAgZWxlbWVudC5jc3ModHJpZ2dlcik7XG4gICAgICB9XG4gICAgICAvL0lmIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0cmFuc2l0aW9ucywgaW5zdGFudGx5IHJlc29sdmVcbiAgICAgIGlmICggIWVuZEV2ZW50TmFtZSApIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFkZCBvdXIgY3VzdG9tIGNhbmNlbCBmdW5jdGlvbiB0byB0aGUgcHJvbWlzZSB0aGF0IGlzIHJldHVybmVkXG4gICAgLy8gV2UgY2FuIGNhbGwgdGhpcyBpZiB3ZSBhcmUgYWJvdXQgdG8gcnVuIGEgbmV3IHRyYW5zaXRpb24sIHdoaWNoIHdlIGtub3cgd2lsbCBwcmV2ZW50IHRoaXMgdHJhbnNpdGlvbiBmcm9tIGVuZGluZyxcbiAgICAvLyBpLmUuIGl0IHdpbGwgdGhlcmVmb3JlIG5ldmVyIHJhaXNlIGEgdHJhbnNpdGlvbkVuZCBldmVudCBmb3IgdGhhdCB0cmFuc2l0aW9uXG4gICAgZGVmZXJyZWQucHJvbWlzZS5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICggZW5kRXZlbnROYW1lICkge1xuICAgICAgICBlbGVtZW50LnVuYmluZChlbmRFdmVudE5hbWUsIHRyYW5zaXRpb25FbmRIYW5kbGVyKTtcbiAgICAgIH1cbiAgICAgIGRlZmVycmVkLnJlamVjdCgnVHJhbnNpdGlvbiBjYW5jZWxsZWQnKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cbiAgLy8gV29yayBvdXQgdGhlIG5hbWUgb2YgdGhlIHRyYW5zaXRpb25FbmQgZXZlbnRcbiAgdmFyIHRyYW5zRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyYW5zJyk7XG4gIHZhciB0cmFuc2l0aW9uRW5kRXZlbnROYW1lcyA9IHtcbiAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAnT1RyYW5zaXRpb24nOiAnb1RyYW5zaXRpb25FbmQnLFxuICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnXG4gIH07XG4gIHZhciBhbmltYXRpb25FbmRFdmVudE5hbWVzID0ge1xuICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdEFuaW1hdGlvbkVuZCcsXG4gICAgJ01velRyYW5zaXRpb24nOiAnYW5pbWF0aW9uZW5kJyxcbiAgICAnT1RyYW5zaXRpb24nOiAnb0FuaW1hdGlvbkVuZCcsXG4gICAgJ3RyYW5zaXRpb24nOiAnYW5pbWF0aW9uZW5kJ1xuICB9O1xuICBmdW5jdGlvbiBmaW5kRW5kRXZlbnROYW1lKGVuZEV2ZW50TmFtZXMpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGVuZEV2ZW50TmFtZXMpe1xuICAgICAgaWYgKHRyYW5zRWxlbWVudC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBlbmRFdmVudE5hbWVzW25hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAkdHJhbnNpdGlvbi50cmFuc2l0aW9uRW5kRXZlbnROYW1lID0gZmluZEVuZEV2ZW50TmFtZSh0cmFuc2l0aW9uRW5kRXZlbnROYW1lcyk7XG4gICR0cmFuc2l0aW9uLmFuaW1hdGlvbkVuZEV2ZW50TmFtZSA9IGZpbmRFbmRFdmVudE5hbWUoYW5pbWF0aW9uRW5kRXZlbnROYW1lcyk7XG4gIHJldHVybiAkdHJhbnNpdGlvbjtcbn1dKTtcbiIsImZ1bmN0aW9uIExvZ2luQ3RybCgkYXV0aCwgJG5vdGljZSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLmVycm9yTWVzc2FnZSA9IGZhbHNlO1xuXG4gIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoJHZhbGlkLCB1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAkYXV0aC5sb2dpbih7dXNlcm5hbWU6IHVzZXJuYW1lLCBwYXNzd29yZDogcGFzc3dvcmR9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBfdGhpcy5lcnJvck1lc3NhZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJG5vdGljZS5zaG93KCdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgbG9nZ2VkIGluJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgX3RoaXMuZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UuZGF0YS5tZXNzYWdlO1xuICAgICAgICAgICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIExvZ291dEN0cmwoJGF1dGgsICRub3RpY2UpIHtcbiAgJGF1dGgubG9nb3V0KClcbiAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbm90aWNlLnNob3coJ1lvdSBoYXZlIGJlZW4gbG9nZ2VkIG91dCcpO1xuICAgICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBQcm9maWxlQ3RybChwcm9maWxlKSB7XG4gIHRoaXMucHJvZmlsZSA9IHByb2ZpbGU7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpXG4gIC5jb250cm9sbGVyKCdMb2dvdXRDdHJsJywgTG9nb3V0Q3RybClcbiAgLmNvbnRyb2xsZXIoJ1Byb2ZpbGVDdHJsJywgUHJvZmlsZUN0cmwpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3N0YXRlcycpO1xucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xucmVxdWlyZSgnLi9pbnRlcmNlcHRvcnMnKVxucmVxdWlyZSgnLi9tb2NrcycpO1xuIiwiZnVuY3Rpb24gQXV0aHpSZXNwb25zZVJlZGlyZWN0KCRxLCAkaW5qZWN0b3IpIHtcblxuICByZXR1cm4ge1xuICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZWplY3Rpb24pIHtcbiAgICAgIHZhclxuICAgICAgICAkc3RhdGUgPSAkaW5qZWN0b3IuZ2V0KCckc3RhdGUnKSxcbiAgICAgICAgJG5vdGljZSA9ICRpbmplY3Rvci5nZXQoJyRub3RpY2UnKTtcblxuICAgICAgLy8gV2UgY2FuIGdldCBhbiAvYXBpLyByZXNwb25zZSBvZiBmb3JiaWRkZW4gZm9yXG4gICAgICAvLyBzb21lIGRhdGEgbmVlZGVkIGluIGEgdmlldy4gRmxhc2ggYSBub3RpY2Ugc2F5aW5nIHRoYXQgdGhpc1xuICAgICAgLy8gZGF0YSB3YXMgcmVxdWVzdGVkLlxuICAgICAgdmFyIHVybCA9IHJlamVjdGlvbi5jb25maWcudXJsO1xuICAgICAgaWYgKHJlamVjdGlvbi5zdGF0dXMgPT0gNDAzIHx8IHJlamVjdGlvbi5zdGF0dXMgPT0gNDAxKSB7XG4gICAgICAgIC8vIFJlZGlyZWN0IHRvIHRoZSBsb2dpbiBmb3JtXG4gICAgICAgICRzdGF0ZS5nbygnYXV0aC5sb2dpbicpO1xuICAgICAgICB2YXIgbXNnID0gJ0xvZ2luIHJlcXVpcmVkIGZvciBkYXRhIGF0OiAnICsgdXJsO1xuICAgICAgICAkbm90aWNlLnNob3cobXNnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkaHR0cFByb3ZpZGVyLCAkYXV0aFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2F1dGh6UmVkaXJlY3QnKTtcblxuICB2YXIgYmFzZVVybCA9ICcnO1xuXG4gIC8vIFNhdGVsbGl6ZXIgc2V0dXBcbiAgJGF1dGhQcm92aWRlci5sb2dpblVybCA9IGJhc2VVcmwgKyAnL2FwaS9hdXRoL2xvZ2luJztcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKCRyb290U2NvcGUsICRzdGF0ZSwgJGF1dGgsICRub3RpY2UpIHtcbiAgLy8gQSBzdGF0ZSBjYW4gYmUgYW5ub3RhdGVkIHdpdGggYSB2YWx1ZSBpbmRpY2F0aW5nXG4gIC8vIHRoZSBzdGF0ZSByZXF1aXJlcyBsb2dpbi5cblxuICAkcm9vdFNjb3BlLiRvbihcbiAgICBcIiRzdGF0ZUNoYW5nZVN0YXJ0XCIsXG4gICAgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlKSB7XG4gICAgICBpZiAodG9TdGF0ZS5hdXRoZW50aWNhdGUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIC8vIFVzZXIgaXNu4oCZdCBhdXRoZW50aWNhdGVkIGFuZCB0aGlzIHN0YXRlIHdhbnRzIGF1dGhcbiAgICAgICAgdmFyIHQgPSB0b1N0YXRlLnRpdGxlIHx8IHRvU3RhdGUubmFtZTtcbiAgICAgICAgdmFyIG1zZyA9ICdUaGUgcGFnZSAnICsgdCArICcgcmVxdWlyZXMgYSBsb2dpbic7XG4gICAgICAgICRub3RpY2Uuc2hvdyhtc2cpXG4gICAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oXCJhdXRoLmxvZ2luXCIpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0pO1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5mYWN0b3J5KCdhdXRoelJlZGlyZWN0JywgQXV0aHpSZXNwb25zZVJlZGlyZWN0KVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZylcbiAgLnJ1bihNb2R1bGVSdW4pOyIsImZ1bmN0aW9uIE1vZHVsZUNvbmZpZyhtb29uZGFzaE1vY2tSZXN0UHJvdmlkZXIpIHtcblxuICB2YXIgdXNlciA9IHtcbiAgICBpZDogJ2FkbWluJyxcbiAgICBlbWFpbDogJ2FkbWluQHguY29tJyxcbiAgICBmaXJzdF9uYW1lOiAnQWRtaW4nLFxuICAgIGxhc3RfbmFtZTogJ0xhc3RpZScsXG4gICAgdHdpdHRlcjogJ2FkbWluJ1xuICB9O1xuXG4gIG1vb25kYXNoTW9ja1Jlc3RQcm92aWRlci5hZGRNb2NrcyhcbiAgICAnYXV0aCcsXG4gICAgW1xuICAgICAge1xuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL21lLyxcbiAgICAgICAgcmVzcG9uc2VEYXRhOiB1c2VyLFxuICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBwYXR0ZXJuOiAvYXBpXFwvYXV0aFxcL2xvZ2luLyxcbiAgICAgICAgcmVzcG9uZGVyOiBmdW5jdGlvbiAobWV0aG9kLCB1cmwsIGRhdGEpIHtcbiAgICAgICAgICBkYXRhID0gYW5ndWxhci5mcm9tSnNvbihkYXRhKTtcbiAgICAgICAgICB2YXIgdW4gPSBkYXRhLnVzZXJuYW1lO1xuICAgICAgICAgIHZhciByZXNwb25zZTtcblxuICAgICAgICAgIGlmICh1biA9PT0gJ2FkbWluJykge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBbMjA0LCB7dG9rZW46IFwibW9ja3Rva2VuXCJ9XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBbNDAxLCB7XCJtZXNzYWdlXCI6IFwiSW52YWxpZCBsb2dpbiBvciBwYXNzd29yZFwifV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXSk7XG5cbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpOyIsImZ1bmN0aW9uIFByb2ZpbGUoUmVzdGFuZ3VsYXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRQcm9maWxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gUmVzdGFuZ3VsYXIub25lKCcvYXBpL2F1dGgvbWUnKS5nZXQoKTtcbiAgICB9XG4gIH07XG59XG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLmZhY3RvcnkoJ01kUHJvZmlsZScsIFByb2ZpbGUpO1xuIiwiZnVuY3Rpb24gTW9kdWxlQ29uZmlnKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhdXRoJywge1xuICAgICAgICAgICAgIHVybDogJy9hdXRoJyxcbiAgICAgICAgICAgICBwYXJlbnQ6ICdyb290J1xuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnYXV0aC5sb2dpbicsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9hdXRoL2xvZ2luLnBhcnRpYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLmxvZ291dCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvbG9nb3V0JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ291dEN0cmwgYXMgY3RybCcsXG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2F1dGgvbG9nb3V0LnBhcnRpYWwuaHRtbCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLnByb2ZpbGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgICAgICAgIC8vYXV0aGVudGljYXRlOiB0cnVlLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9hdXRoL3Byb2ZpbGUucGFydGlhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2ZpbGVDdHJsIGFzIGN0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICBwcm9maWxlOiBmdW5jdGlvbiAoTWRQcm9maWxlKSB7XG4gICAgICAgICAgICAgICAgIHJldHVybiBNZFByb2ZpbGUuZ2V0UHJvZmlsZSgpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoUmVzdGFuZ3VsYXJQcm92aWRlcikge1xuICBSZXN0YW5ndWxhclByb3ZpZGVyLnNldEJhc2VVcmwoJy9hcGknKTtcbn1cblxuZnVuY3Rpb24gTWRDb25maWcoKSB7XG4gIHRoaXMuc2l0ZU5hbWUgPSAnTW9vbmRhc2gnO1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5zZXJ2aWNlKCdNZENvbmZpZycsIE1kQ29uZmlnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgncm9vdC5kYXNoYm9hcmQnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgc2VjdGlvbjoge1xuICAgICAgICAgICAgICAgZ3JvdXA6ICdyb290JyxcbiAgICAgICAgICAgICAgIGxhYmVsOiAnRGFzaGJvYXJkJyxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAxXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5kYXNoYm9hcmQuYWxsJywge1xuICAgICAgICAgICAgIHVybDogJy9hbGwnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIHNlY3Rpb246ICdyb290LmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ0FsbCcsXG4gICAgICAgICAgICAgICBwcmlvcml0eTogMFxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPkRhc2hib2FyZDwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QuZGFzaGJvYXJkLnNvbWUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NvbWUnLFxuICAgICAgICAgICAgIHN1YnNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIHNlY3Rpb246ICdyb290LmRhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBncm91cDogJ2Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ1NvbWUnXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5zZXR0aW5ncycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgICAgICAgIHNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIGdyb3VwOiAncm9vdCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ1NldHRpbmdzJyxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAyXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+U2V0dGluZ3M8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnR5cGVzJywge1xuICAgICAgICAgICAgIHVybDogJy90eXBlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPlR5cGVzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcy51c2VycycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5Vc2VyczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QudHlwZXMuaW52b2ljZXMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2ludm9pY2VzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+SW52b2ljZXM8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gTGF5b3V0Q3RybCgkcm9vdFNjb3BlLCBNZExheW91dCkge1xuICAkcm9vdFNjb3BlLmxheW91dCA9IE1kTGF5b3V0O1xufVxuXG5mdW5jdGlvbiBIZWFkZXJDdHJsKCRzdGF0ZSwgTWRDb25maWcsICRhdXRoKSB7XG4gIHRoaXMuJGF1dGggPSAkYXV0aDtcbiAgdGhpcy5zaXRlTmFtZSA9IE1kQ29uZmlnLnNpdGVOYW1lO1xufVxuXG5mdW5jdGlvbiBTZWN0aW9uc0N0cmwoTWRTZWN0aW9ucywgJHN0YXRlKSB7XG4gIHRoaXMuc2VjdGlvbkdyb3VwcyA9IE1kU2VjdGlvbnMuZ2V0U2VjdGlvbkdyb3Vwcygkc3RhdGUpO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29udHJvbGxlcignTGF5b3V0Q3RybCcsIExheW91dEN0cmwpXG4gIC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybClcbiAgLmNvbnRyb2xsZXIoJ1NlY3Rpb25zQ3RybCcsIFNlY3Rpb25zQ3RybCk7XG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG4iLCJmdW5jdGlvbiBNZExheW91dFNlcnZpY2UoJHJvb3RTY29wZSwgTWRDb25maWcpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5wYWdlVGl0bGUgPSBNZENvbmZpZy5zaXRlTmFtZTtcblxuICAvLyBXaGVuZXZlciB0aGUgc3RhdGUgY2hhbmdlcywgdXBkYXRlIHRoZSBwYWdlVGl0bGVcbiAgZnVuY3Rpb24gY2hhbmdlVGl0bGUoZXZ0LCB0b1N0YXRlKSB7XG4gICAgaWYgKHRvU3RhdGUudGl0bGUpIHtcbiAgICAgIC8vIFN1cmUgd291bGQgbGlrZSB0byBhdXRvbWF0aWNhbGx5IHB1dCBpbiByZXNvdXJjZS50aXRsZSBidXRcbiAgICAgIC8vIHVuZm9ydHVuYXRlbHkgdWktcm91dGVyIGRvZXNuJ3QgZ2l2ZSBtZSBhY2Nlc3MgdG8gdGhlIHJlc29sdmVcbiAgICAgIC8vIGZyb20gdGhpcyBldmVudC5cbiAgICAgIF90aGlzLnBhZ2VUaXRsZSA9IE1kQ29uZmlnLnNpdGVOYW1lICsgJyAtICcgKyB0b1N0YXRlLnRpdGxlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZXNldCB0byBkZWZhdWx0XG4gICAgICBfdGhpcy5wYWdlVGl0bGUgPSBNZENvbmZpZy5zaXRlTmFtZTtcbiAgICB9XG4gIH1cblxuICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGNoYW5nZVRpdGxlKTtcbn1cblxuZnVuY3Rpb24gTWRTZWN0aW9uc1NlcnZpY2UoKSB7XG4gIHRoaXMuYWRkU2VjdGlvbiA9IGZ1bmN0aW9uIChncm91cElkLCBzZWN0aW9uKSB7XG4gICAgLy8gQWxsb3cgc2l0ZWRldiBhcHAgdG8gZXh0ZW5kIHRoZSByb290IHNlY3Rpb24gZ3JvdXBcbiAgfTtcblxuICB0aGlzLmdldFNlY3Rpb25Hcm91cHMgPSBmdW5jdGlvbiAoJHN0YXRlKSB7XG4gICAgdmFyIHNlY3Rpb25Hcm91cHMgPSB7fSxcbiAgICAgIHNlY3Rpb25zID0ge307XG5cbiAgICAvLyBGaXJzdCBnZXQgYWxsIHRoZSBzZWN0aW9uIGdyb3Vwc1xuICAgIHZhciBhbGxTdGF0ZXMgPSAkc3RhdGUuZ2V0KCk7XG4gICAgXyhhbGxTdGF0ZXMpXG4gICAgICAuZmlsdGVyKCdzZWN0aW9uR3JvdXAnKVxuICAgICAgLmZvckVhY2goXG4gICAgICBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgdmFyIHNnID0gXyhzdGF0ZS5zZWN0aW9uR3JvdXApXG4gICAgICAgICAgLnBpY2soWydsYWJlbCcsICdwcmlvcml0eSddKS52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghc2cubGFiZWwpIHNnLmxhYmVsID0gc3RhdGUudGl0bGU7XG4gICAgICAgIHNnLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbkdyb3Vwc1tzZy5zdGF0ZV0gPSBzZztcbiAgICAgIH0pO1xuXG4gICAgLy8gTm93IGdldCB0aGUgc2VjdGlvbnNcbiAgICBfKGFsbFN0YXRlcykuZmlsdGVyKCdzZWN0aW9uJylcbiAgICAgIC5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHZhciBzZWN0aW9uID0gc3RhdGUuc2VjdGlvbjtcbiAgICAgICAgdmFyIHMgPSBfKHNlY3Rpb24pLnBpY2soWydncm91cCcsICdsYWJlbCcsICdwcmlvcml0eSddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghcy5sYWJlbCkgcy5sYWJlbCA9IHN0YXRlLnRpdGxlO1xuICAgICAgICBzLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbnNbcy5zdGF0ZV0gPSBzO1xuICAgICAgfSk7XG5cbiAgICAvLyBBbmQgYW55IHN1YnNlY3Rpb25zXG4gICAgXyhhbGxTdGF0ZXMpLmZpbHRlcignc3Vic2VjdGlvbicpXG4gICAgICAuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc3Vic2VjdGlvbiA9IHN0YXRlLnN1YnNlY3Rpb247XG4gICAgICAgIHZhciBzZWN0aW9uID0gc2VjdGlvbnNbc3Vic2VjdGlvbi5zZWN0aW9uXTtcblxuICAgICAgICAvLyBJZiB0aGlzIHNlY3Rpb24gZG9lc24ndCB5ZXQgaGF2ZSBhbiBzdWJzZWN0aW9ucywgbWFrZSBvbmVcbiAgICAgICAgaWYgKCFzZWN0aW9uLnN1YnNlY3Rpb25zKSB7XG4gICAgICAgICAgc2VjdGlvbi5zdWJzZWN0aW9ucyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoaXMgc3Vic2VjdGlvblxuICAgICAgICB2YXIgc3MgPSBfKHN1YnNlY3Rpb24pLnBpY2soWydwcmlvcml0eScsICdsYWJlbCddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICAvLyBJZiBubyBsYWJlbCwgdHJ5IGEgdGl0bGUgb24gdGhlIHN0YXRlXG4gICAgICAgIGlmICghc3MubGFiZWwpIHNzLmxhYmVsID0gc3RhdGUudGl0bGU7XG4gICAgICAgIHNzLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbi5zdWJzZWN0aW9ucy5wdXNoKHNzKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gTm93IHJlLWFzc2VtYmxlIHdpdGggc29ydGluZ1xuICAgIHJldHVybiBfKHNlY3Rpb25Hcm91cHMpXG4gICAgICAubWFwKFxuICAgICAgZnVuY3Rpb24gKHNnKSB7XG4gICAgICAgIC8vIEdldCBhbGwgdGhlIHNlY3Rpb25zIGZvciB0aGlzIHNlY3Rpb24gZ3JvdXBcbiAgICAgICAgc2cuc2VjdGlvbnMgPSBfKHNlY3Rpb25zKVxuICAgICAgICAgIC5maWx0ZXIoe2dyb3VwOiBzZy5zdGF0ZX0pXG4gICAgICAgICAgLm1hcChcbiAgICAgICAgICBmdW5jdGlvbiAocykge1xuICAgICAgICAgICAgaWYgKHMuc3Vic2VjdGlvbnMpIHtcbiAgICAgICAgICAgICAgdmFyIG5ld1N1YnNlY3Rpb25zID0gXyhzLnN1YnNlY3Rpb25zKVxuICAgICAgICAgICAgICAgIC5zb3J0QnkoJ3ByaW9yaXR5JylcbiAgICAgICAgICAgICAgICAudmFsdWUoKTtcbiAgICAgICAgICAgICAgcy5zdWJzZWN0aW9ucyA9IG5ld1N1YnNlY3Rpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAgICAgLnZhbHVlKCk7XG4gICAgICAgIHJldHVybiBzZztcbiAgICAgIH0pXG4gICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAudmFsdWUoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb2R1bGVSdW4oJHJvb3RTY29wZSwgTWRMYXlvdXQpIHtcbiAgJHJvb3RTY29wZS5sYXlvdXQgPSBNZExheW91dDtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLnNlcnZpY2UoJ01kTGF5b3V0JywgTWRMYXlvdXRTZXJ2aWNlKVxuICAuc2VydmljZSgnTWRTZWN0aW9ucycsIE1kU2VjdGlvbnNTZXJ2aWNlKVxuICAucnVuKE1vZHVsZVJ1bik7XG4iLCJmdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2xheW91dCcsIHtcbiAgICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtbGF5b3V0LnBhcnRpYWwuaHRtbCcsXG4gICAgICAgICAgICAgY29udHJvbGxlcjogXCJMYXlvdXRDdHJsXCJcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgICBzZWN0aW9uR3JvdXA6IHtcbiAgICAgICAgICAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgIHByaW9yaXR5OiAwXG4gICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWhlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLWhlYWRlci5wYXJ0aWFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSGVhZGVyQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1zZWN0aW9uc21lbnUnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xheW91dC9tZC1zZWN0aW9uc21lbnUucGFydGlhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NlY3Rpb25zQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgdWktdmlldz1cIm1kLWNvbnRlbnRcIj48L2Rpdj4nXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLWZvb3Rlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLWZvb3Rlci5wYXJ0aWFsLmh0bWwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpOyIsIid1c2Ugc3RyaWN0JztcblxuLypcblxuIFdoZW4gcnVubmluZyBpbiBkZXYgbW9kZSwgbW9jayB0aGUgY2FsbHMgdG8gdGhlIFJFU1QgQVBJLCB0aGVuXG4gcGFzcyBldmVyeXRoaW5nIGVsc2UgdGhyb3VnaC5cblxuICovXG5cbnJlcXVpcmUoJy4vcHJvdmlkZXJzJyk7XG5cbi8vIFRPRE8gTm90IHN1cmUgaWYgdGhlcmUgaXMgYSB3YXksIG5vdyB0aGF0IHdlIGFyZSB1c2luZyBDb21tb25KUywgdG9cbi8vIGVsaW1pbmF0ZSB0aGlzIGxpdHRsZSBJSUZFLlxuXG4oZnVuY3Rpb24gKG1vZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgbW9kLnJ1bihmdW5jdGlvbiAoJGh0dHBCYWNrZW5kLCBtb29uZGFzaE1vY2tSZXN0KSB7XG5cbiAgICBtb29uZGFzaE1vY2tSZXN0LnJlZ2lzdGVyTW9ja3MoJGh0dHBCYWNrZW5kKTtcblxuICAgIC8vIHBhc3MgdGhyb3VnaCBldmVyeXRoaW5nIGVsc2VcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG4gICAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgICAkaHR0cEJhY2tlbmQud2hlblBVVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG5cbiAgfSk7XG5cbn0oYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoTW9jaycsIFsnbW9vbmRhc2gnLCAnbmdNb2NrRTJFJ10pKSk7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gTW9vbmRhc2hNb2NrcygpIHtcbiAgdGhpcy5tb2NrcyA9IHt9O1xuXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9ja3MgPSB0aGlzLm1vY2tzO1xuICAgIHJldHVybiB7XG4gICAgICByZWdpc3Rlck1vY2tzOiBmdW5jdGlvbiAoJGh0dHBCYWNrZW5kKSB7XG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgbW9ja3MgYW5kIHJlZ2lzdGVyIHRoZW1cbiAgICAgICAgXy5tYXAobW9ja3MsIGZ1bmN0aW9uIChtb2R1bGVNb2Nrcykge1xuICAgICAgICAgIF8obW9kdWxlTW9ja3MpLmZvckVhY2goZnVuY3Rpb24gKG1vY2spIHtcbiAgICAgICAgICAgIC8vIEdldCB0aGUgZGF0YSBmcm9tIHRoZSBtb2NrXG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gbW9jay5tZXRob2QgfHwgJ0dFVCcsXG4gICAgICAgICAgICAgIHBhdHRlcm4gPSBtb2NrLnBhdHRlcm4sXG4gICAgICAgICAgICAgIHJlc3BvbmRlciA9IG1vY2sucmVzcG9uZGVyLFxuICAgICAgICAgICAgICByZXNwb25zZURhdGEgPSBtb2NrLnJlc3BvbnNlRGF0YTtcblxuICAgICAgICAgICAgdmFyIHdyYXBwZWRSZXNwb25kZXIgPSBmdW5jdGlvbiAobWV0aG9kLCB1cmwsIGRhdGEsIGhlYWRlcnMpIHtcblxuICAgICAgICAgICAgICAvLyBJZiB0aGUgbW9jayBzYXlzIHRvIGF1dGhlbnRpY2F0ZSBhbmQgd2UgZG9uJ3QgaGF2ZVxuICAgICAgICAgICAgICAvLyBhbiBBdXRob3JpemF0aW9uIGhlYWRlciwgcmV0dXJuIDQwMS5cbiAgICAgICAgICAgICAgaWYgKG1vY2suYXV0aGVudGljYXRlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGF1dGh6ID0gaGVhZGVyc1snQXV0aG9yaXphdGlvbiddO1xuICAgICAgICAgICAgICAgIGlmICghYXV0aHopIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBbNDAxLCB7XCJtZXNzYWdlXCI6IFwiTG9naW4gcmVxdWlyZWRcIn1dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEEgZ2VuZXJpYyByZXNwb25kZXIgZm9yIGhhbmRsaW5nIHRoZSBjYXNlIHdoZXJlIHRoZVxuICAgICAgICAgICAgICAvLyBtb2NrIGp1c3Qgd2FudGVkIHRoZSBiYXNpY3MgYW5kIHN1cHBsaWVkIHJlc3BvbnNlRGF0YVxuICAgICAgICAgICAgICBpZiAoIXJlc3BvbmRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBbMjAwLCByZXNwb25zZURhdGFdXG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBHb3QgaGVyZSwgc28gbGV0J3MgZ28gYWhlYWQgYW5kIGNhbGwgdGhlXG4gICAgICAgICAgICAgIC8vIHJlZ2lzdGVyZWQgcmVzcG9uZGVyXG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25kZXIobWV0aG9kLCB1cmwsIGRhdGEsIGhlYWRlcnMpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkaHR0cEJhY2tlbmQud2hlbihtZXRob2QsIHBhdHRlcm4pXG4gICAgICAgICAgICAgIC5yZXNwb25kKHdyYXBwZWRSZXNwb25kZXIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIHRoaXMuYWRkTW9ja3MgPSBmdW5jdGlvbiAoaywgdikge1xuICAgIHRoaXMubW9ja3Nba10gPSB2O1xuICB9O1xufVxuXG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLnByb3ZpZGVyKCdtb29uZGFzaE1vY2tSZXN0JywgTW9vbmRhc2hNb2Nrcyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsImZ1bmN0aW9uIE5vdGljZUN0cmwoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgdmFyIHNlY29uZHMgPSAzO1xuICB2YXIgdGltZXIgPSAkdGltZW91dChcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfSwgc2Vjb25kcyAqIDEwMDBcbiAgKTtcbiAgJHNjb3BlLiRvbihcbiAgICAnZGVzdHJveScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9KVxufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29udHJvbGxlcignTm90aWNlQ3RybCcsIE5vdGljZUN0cmwpOyIsInJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMnKTsiLCJmdW5jdGlvbiBOb3RpY2VTZXJ2aWNlKCRtb2RhbCkge1xuICB0aGlzLnNob3cgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgIHZhciBtb2RhbEluc3RhbmNlID0gJG1vZGFsLm9wZW4oXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbm90aWNlTW9kYWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdOb3RpY2VDdHJsIGFzIGN0cmwnLFxuICAgICAgICBzaXplOiAnc20nLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgbWVzc2FnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSk7XG5cbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuc2VydmljZSgnJG5vdGljZScsIE5vdGljZVNlcnZpY2UpOyJdfQ==
