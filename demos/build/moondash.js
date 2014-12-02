(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var dependencies = ['ui.router', 'restangular'];

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":2,"./configurator":4,"./globalsection":6,"./layout":9,"./mockapi":12}],2:[function(require,module,exports){
'use strict';

var twitter = require("./twitter");

var login = function() {
    console.log("Please login");
};

module.exports = {
    login: login,
    twitter: twitter
};
},{"./twitter":3}],3:[function(require,module,exports){
'use strict';

var login = function () {
  console.log("Please login using Twitter");
};
module.exports = {
  login: login
};
},{}],4:[function(require,module,exports){
'use strict';

require('./services');


},{"./services":5}],5:[function(require,module,exports){
'use strict';

function ModuleInit(RestangularProvider) {
  RestangularProvider.setBaseUrl('/api');
}

function MdConfig() {
  this.siteName = 'Moondash';
}


angular.module("moondash")
  .config(ModuleInit)
  .service('MdConfig', MdConfig);

},{}],6:[function(require,module,exports){
'use strict';

require('./states');

},{"./states":7}],7:[function(require,module,exports){
function ModuleInit($stateProvider) {
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
  .config(ModuleInit);
},{}],8:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderCtrl($state, MdConfig) {
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
},{}],9:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');
require('./services');

},{"./controllers":8,"./services":10,"./states":11}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
function ModuleInit($stateProvider) {
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
  .config(ModuleInit);
},{}],12:[function(require,module,exports){
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
},{"./providers":13}],13:[function(require,module,exports){
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
            // Make method and responder optional
            var method = mock.method ? mock.method : 'GET',
              genericResponder = function () {
                return [200, mock.responseData];
              };
            var responder = mock.responder ? mock.responder : genericResponder;

            $httpBackend.when(method, mock.pattern)
              .respond(responder);
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2F1dGgvaW5kZXguanMiLCJzcmMvYXV0aC90d2l0dGVyL2luZGV4LmpzIiwic3JjL2NvbmZpZ3VyYXRvci9pbmRleC5qcyIsInNyYy9jb25maWd1cmF0b3Ivc2VydmljZXMuanMiLCJzcmMvZ2xvYmFsc2VjdGlvbi9pbmRleC5qcyIsInNyYy9nbG9iYWxzZWN0aW9uL3N0YXRlcy5qcyIsInNyYy9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvbGF5b3V0L2luZGV4LmpzIiwic3JjL2xheW91dC9zZXJ2aWNlcy5qcyIsInNyYy9sYXlvdXQvc3RhdGVzLmpzIiwic3JjL21vY2thcGkvaW5kZXguanMiLCJzcmMvbW9ja2FwaS9wcm92aWRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuXG4gRGVjbGFyZSB0aGUgbW9kdWxlIHdpdGggZGVwZW5kZW5jaWVzLCBhbmQgbm90aGluZyBtb3JlLlxuXG4gSWYgcnVubmluZyBpbiBcImRldmVsb3BtZW50IG1vZGVcIiwgaW5qZWN0IHRoZSBtb2NrIGluZnJhc3RydWN0dXJlLlxuXG4gKi9cblxudmFyIGRlcGVuZGVuY2llcyA9IFsndWkucm91dGVyJywgJ3Jlc3Rhbmd1bGFyJ107XG5cbi8vIElmIG5nTW9jayBpcyBsb2FkZWQsIGl0IHRha2VzIG92ZXIgdGhlIGJhY2tlbmQuIFdlIHNob3VsZCBvbmx5IGFkZFxuLy8gaXQgdG8gdGhlIGxpc3Qgb2YgbW9kdWxlIGRlcGVuZGVuY2llcyBpZiB3ZSBhcmUgaW4gXCJmcm9udGVuZCBtb2NrXCJcbi8vIG1vZGUuIEZsYWcgdGhpcyBieSBwdXR0aW5nIHRoZSBjbGFzcyAuZnJvbnRlbmRNb2NrIG9uIHNvbWUgZWxlbWVudFxuLy8gaW4gdGhlIGRlbW8gLmh0bWwgcGFnZS5cbnZhciBtb2NrQXBpID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm1vY2tBcGknKTtcbmlmIChtb2NrQXBpKSB7XG4gIGRlcGVuZGVuY2llcy5wdXNoKCduZ01vY2tFMkUnKTtcbiAgZGVwZW5kZW5jaWVzLnB1c2goJ21vb25kYXNoTW9jaycpO1xufVxuXG52YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcsIGRlcGVuZGVuY2llcyk7XG5cbi8vIE5vdyB0aGUgTW9vbmRhc2ggY29tcG9uZW50c1xucmVxdWlyZSgnLi9sYXlvdXQnKTtcbnJlcXVpcmUoJy4vZ2xvYmFsc2VjdGlvbicpO1xucmVxdWlyZSgnLi9jb25maWd1cmF0b3InKTtcbnJlcXVpcmUoJy4vbW9ja2FwaScpO1xucmVxdWlyZSgnLi9hdXRoJyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHR3aXR0ZXIgPSByZXF1aXJlKFwiLi90d2l0dGVyXCIpO1xuXG52YXIgbG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcIlBsZWFzZSBsb2dpblwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxvZ2luOiBsb2dpbixcbiAgICB0d2l0dGVyOiB0d2l0dGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGxvZ2luID0gZnVuY3Rpb24gKCkge1xuICBjb25zb2xlLmxvZyhcIlBsZWFzZSBsb2dpbiB1c2luZyBUd2l0dGVyXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBsb2dpbjogbG9naW5cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTW9kdWxlSW5pdChSZXN0YW5ndWxhclByb3ZpZGVyKSB7XG4gIFJlc3Rhbmd1bGFyUHJvdmlkZXIuc2V0QmFzZVVybCgnL2FwaScpO1xufVxuXG5mdW5jdGlvbiBNZENvbmZpZygpIHtcbiAgdGhpcy5zaXRlTmFtZSA9ICdNb29uZGFzaCc7XG59XG5cblxuYW5ndWxhci5tb2R1bGUoXCJtb29uZGFzaFwiKVxuICAuY29uZmlnKE1vZHVsZUluaXQpXG4gIC5zZXJ2aWNlKCdNZENvbmZpZycsIE1kQ29uZmlnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIE1vZHVsZUluaXQoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3Jvb3QuZGFzaGJvYXJkJywge1xuICAgICAgICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAgICAgIHNlY3Rpb246IHtcbiAgICAgICAgICAgICAgIGdyb3VwOiAncm9vdCcsXG4gICAgICAgICAgICAgICBsYWJlbDogJ0Rhc2hib2FyZCcsXG4gICAgICAgICAgICAgICBwcmlvcml0eTogMVxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPkRhc2hib2FyZDwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QuZGFzaGJvYXJkLmFsbCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYWxsJyxcbiAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7XG4gICAgICAgICAgICAgICBzZWN0aW9uOiAncm9vdC5kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgbGFiZWw6ICdBbGwnLFxuICAgICAgICAgICAgICAgcHJpb3JpdHk6IDBcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5EYXNoYm9hcmQ8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LmRhc2hib2FyZC5zb21lJywge1xuICAgICAgICAgICAgIHVybDogJy9zb21lJyxcbiAgICAgICAgICAgICBzdWJzZWN0aW9uOiB7XG4gICAgICAgICAgICAgICBzZWN0aW9uOiAncm9vdC5kYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgZ3JvdXA6ICdkYXNoYm9hcmQnLFxuICAgICAgICAgICAgICAgbGFiZWw6ICdTb21lJ1xuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPkRhc2hib2FyZDwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3Quc2V0dGluZ3MnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3NldHRpbmdzJyxcbiAgICAgICAgICAgICBzZWN0aW9uOiB7XG4gICAgICAgICAgICAgICBncm91cDogJ3Jvb3QnLFxuICAgICAgICAgICAgICAgbGFiZWw6ICdTZXR0aW5ncycsXG4gICAgICAgICAgICAgICBwcmlvcml0eTogMlxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPlNldHRpbmdzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvdHlwZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5UeXBlczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QudHlwZXMudXNlcnMnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+VXNlcnM8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnR5cGVzLmludm9pY2VzJywge1xuICAgICAgICAgICAgIHVybDogJy9pbnZvaWNlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPkludm9pY2VzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbn1cblxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUluaXQpOyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBMYXlvdXRDdHJsKCRyb290U2NvcGUsIE1kTGF5b3V0KSB7XG4gICRyb290U2NvcGUubGF5b3V0ID0gTWRMYXlvdXQ7XG59XG5cbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHN0YXRlLCBNZENvbmZpZykge1xuICB0aGlzLnNpdGVOYW1lID0gTWRDb25maWcuc2l0ZU5hbWU7XG59XG5cbmZ1bmN0aW9uIFNlY3Rpb25zQ3RybChNZFNlY3Rpb25zLCAkc3RhdGUpIHtcbiAgdGhpcy5zZWN0aW9uR3JvdXBzID0gTWRTZWN0aW9ucy5nZXRTZWN0aW9uR3JvdXBzKCRzdGF0ZSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb250cm9sbGVyKCdMYXlvdXRDdHJsJywgTGF5b3V0Q3RybClcbiAgLmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBIZWFkZXJDdHJsKVxuICAuY29udHJvbGxlcignU2VjdGlvbnNDdHJsJywgU2VjdGlvbnNDdHJsKTtcbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcbiIsImZ1bmN0aW9uIE1kTGF5b3V0U2VydmljZSgkcm9vdFNjb3BlLCBNZENvbmZpZykge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLnBhZ2VUaXRsZSA9IE1kQ29uZmlnLnNpdGVOYW1lO1xuXG4gIC8vIFdoZW5ldmVyIHRoZSBzdGF0ZSBjaGFuZ2VzLCB1cGRhdGUgdGhlIHBhZ2VUaXRsZVxuICBmdW5jdGlvbiBjaGFuZ2VUaXRsZShldnQsIHRvU3RhdGUpIHtcbiAgICBpZiAodG9TdGF0ZS50aXRsZSkge1xuICAgICAgLy8gU3VyZSB3b3VsZCBsaWtlIHRvIGF1dG9tYXRpY2FsbHkgcHV0IGluIHJlc291cmNlLnRpdGxlIGJ1dFxuICAgICAgLy8gdW5mb3J0dW5hdGVseSB1aS1yb3V0ZXIgZG9lc24ndCBnaXZlIG1lIGFjY2VzcyB0byB0aGUgcmVzb2x2ZVxuICAgICAgLy8gZnJvbSB0aGlzIGV2ZW50LlxuICAgICAgX3RoaXMucGFnZVRpdGxlID0gTWRDb25maWcuc2l0ZU5hbWUgKyAnIC0gJyArIHRvU3RhdGUudGl0bGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlc2V0IHRvIGRlZmF1bHRcbiAgICAgIF90aGlzLnBhZ2VUaXRsZSA9IE1kQ29uZmlnLnNpdGVOYW1lO1xuICAgIH1cbiAgfVxuXG4gICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgY2hhbmdlVGl0bGUpO1xufVxuXG5mdW5jdGlvbiBNZFNlY3Rpb25zU2VydmljZSgpIHtcbiAgdGhpcy5hZGRTZWN0aW9uID0gZnVuY3Rpb24gKGdyb3VwSWQsIHNlY3Rpb24pIHtcbiAgICAvLyBBbGxvdyBzaXRlZGV2IGFwcCB0byBleHRlbmQgdGhlIHJvb3Qgc2VjdGlvbiBncm91cFxuICB9O1xuXG4gIHRoaXMuZ2V0U2VjdGlvbkdyb3VwcyA9IGZ1bmN0aW9uICgkc3RhdGUpIHtcbiAgICB2YXIgc2VjdGlvbkdyb3VwcyA9IHt9LFxuICAgICAgc2VjdGlvbnMgPSB7fTtcblxuICAgIC8vIEZpcnN0IGdldCBhbGwgdGhlIHNlY3Rpb24gZ3JvdXBzXG4gICAgdmFyIGFsbFN0YXRlcyA9ICRzdGF0ZS5nZXQoKTtcbiAgICBfKGFsbFN0YXRlcylcbiAgICAgIC5maWx0ZXIoJ3NlY3Rpb25Hcm91cCcpXG4gICAgICAuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc2cgPSBfKHN0YXRlLnNlY3Rpb25Hcm91cClcbiAgICAgICAgICAucGljayhbJ2xhYmVsJywgJ3ByaW9yaXR5J10pLnZhbHVlKCk7XG4gICAgICAgIHNnLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbkdyb3Vwc1tzZy5zdGF0ZV0gPSBzZztcbiAgICAgIH0pO1xuXG4gICAgLy8gTm93IGdldCB0aGUgc2VjdGlvbnNcbiAgICBfKGFsbFN0YXRlcykuZmlsdGVyKCdzZWN0aW9uJylcbiAgICAgIC5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHZhciBzZWN0aW9uID0gc3RhdGUuc2VjdGlvbjtcbiAgICAgICAgdmFyIHMgPSBfKHNlY3Rpb24pLnBpY2soWydncm91cCcsICdsYWJlbCcsICdwcmlvcml0eSddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICBzLnN0YXRlID0gc3RhdGUubmFtZTtcbiAgICAgICAgc2VjdGlvbnNbcy5zdGF0ZV0gPSBzO1xuICAgICAgfSk7XG5cbiAgICAvLyBBbmQgYW55IHN1YnNlY3Rpb25zXG4gICAgXyhhbGxTdGF0ZXMpLmZpbHRlcignc3Vic2VjdGlvbicpXG4gICAgICAuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICB2YXIgc3Vic2VjdGlvbiA9IHN0YXRlLnN1YnNlY3Rpb247XG4gICAgICAgIHZhciBzZWN0aW9uID0gc2VjdGlvbnNbc3Vic2VjdGlvbi5zZWN0aW9uXTtcblxuICAgICAgICAvLyBJZiB0aGlzIHNlY3Rpb24gZG9lc24ndCB5ZXQgaGF2ZSBhbiBzdWJzZWN0aW9ucywgbWFrZSBvbmVcbiAgICAgICAgaWYgKCFzZWN0aW9uLnN1YnNlY3Rpb25zKSB7XG4gICAgICAgICAgc2VjdGlvbi5zdWJzZWN0aW9ucyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoaXMgc3Vic2VjdGlvblxuICAgICAgICB2YXIgc3MgPSBfKHN1YnNlY3Rpb24pLnBpY2soWydwcmlvcml0eScsICdsYWJlbCddKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICBzcy5zdGF0ZSA9IHN0YXRlLm5hbWU7XG4gICAgICAgIHNlY3Rpb24uc3Vic2VjdGlvbnMucHVzaChzcyk7XG4gICAgICB9KTtcblxuICAgIC8vIE5vdyByZS1hc3NlbWJsZSB3aXRoIHNvcnRpbmdcbiAgICByZXR1cm4gXyhzZWN0aW9uR3JvdXBzKVxuICAgICAgLm1hcChcbiAgICAgIGZ1bmN0aW9uIChzZykge1xuICAgICAgICAvLyBHZXQgYWxsIHRoZSBzZWN0aW9ucyBmb3IgdGhpcyBzZWN0aW9uIGdyb3VwXG4gICAgICAgIHNnLnNlY3Rpb25zID0gXyhzZWN0aW9ucylcbiAgICAgICAgICAuZmlsdGVyKHtncm91cDogc2cuc3RhdGV9KVxuICAgICAgICAgIC5tYXAoXG4gICAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICAgIGlmIChzLnN1YnNlY3Rpb25zKSB7XG4gICAgICAgICAgICAgIHZhciBuZXdTdWJzZWN0aW9ucyA9IF8ocy5zdWJzZWN0aW9ucylcbiAgICAgICAgICAgICAgICAuc29ydEJ5KCdwcmlvcml0eScpXG4gICAgICAgICAgICAgICAgLnZhbHVlKCk7XG4gICAgICAgICAgICAgIHMuc3Vic2VjdGlvbnMgPSBuZXdTdWJzZWN0aW9ucztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnNvcnRCeSgncHJpb3JpdHknKVxuICAgICAgICAgIC52YWx1ZSgpO1xuICAgICAgICByZXR1cm4gc2c7XG4gICAgICB9KVxuICAgICAgLnNvcnRCeSgncHJpb3JpdHknKVxuICAgICAgLnZhbHVlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKCRyb290U2NvcGUsIE1kTGF5b3V0KSB7XG4gICRyb290U2NvcGUubGF5b3V0ID0gTWRMYXlvdXQ7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5zZXJ2aWNlKCdNZExheW91dCcsIE1kTGF5b3V0U2VydmljZSlcbiAgLnNlcnZpY2UoJ01kU2VjdGlvbnMnLCBNZFNlY3Rpb25zU2VydmljZSlcbiAgLnJ1bihNb2R1bGVSdW4pO1xuIiwiZnVuY3Rpb24gTW9kdWxlSW5pdCgkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnbGF5b3V0Jywge1xuICAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xheW91dC9tZC1sYXlvdXQucGFydGlhbC5odG1sJyxcbiAgICAgICAgICAgICBjb250cm9sbGVyOiBcIkxheW91dEN0cmxcIlxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdCcsIHtcbiAgICAgICAgICAgICBwYXJlbnQ6ICdsYXlvdXQnLFxuICAgICAgICAgICAgIHNlY3Rpb25Hcm91cDoge1xuICAgICAgICAgICAgICAgbGFiZWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgcHJpb3JpdHk6IDBcbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtaGVhZGVyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtaGVhZGVyLnBhcnRpYWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdIZWFkZXJDdHJsIGFzIGN0cmwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLXNlY3Rpb25zbWVudSc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLXNlY3Rpb25zbWVudS5wYXJ0aWFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2VjdGlvbnNDdHJsIGFzIGN0cmwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiB1aS12aWV3PVwibWQtY29udGVudFwiPjwvZGl2PidcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAnbWQtZm9vdGVyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtZm9vdGVyLnBhcnRpYWwuaHRtbCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUluaXQpOyIsIid1c2Ugc3RyaWN0JztcblxuLypcblxuIFdoZW4gcnVubmluZyBpbiBkZXYgbW9kZSwgbW9jayB0aGUgY2FsbHMgdG8gdGhlIFJFU1QgQVBJLCB0aGVuXG4gcGFzcyBldmVyeXRoaW5nIGVsc2UgdGhyb3VnaC5cblxuICovXG5cbnJlcXVpcmUoJy4vcHJvdmlkZXJzJyk7XG5cbi8vIFRPRE8gTm90IHN1cmUgaWYgdGhlcmUgaXMgYSB3YXksIG5vdyB0aGF0IHdlIGFyZSB1c2luZyBDb21tb25KUywgdG9cbi8vIGVsaW1pbmF0ZSB0aGlzIGxpdHRsZSBJSUZFLlxuXG4oZnVuY3Rpb24gKG1vZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgbW9kLnJ1bihmdW5jdGlvbiAoJGh0dHBCYWNrZW5kLCBtb29uZGFzaE1vY2tSZXN0KSB7XG5cbiAgICBtb29uZGFzaE1vY2tSZXN0LnJlZ2lzdGVyTW9ja3MoJGh0dHBCYWNrZW5kKTtcblxuICAgIC8vIHBhc3MgdGhyb3VnaCBldmVyeXRoaW5nIGVsc2VcbiAgICAkaHR0cEJhY2tlbmQud2hlbkdFVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG4gICAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgICAkaHR0cEJhY2tlbmQud2hlblBVVCgvXFwvKi8pLnBhc3NUaHJvdWdoKCk7XG5cbiAgfSk7XG5cbn0oYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoTW9jaycsIFsnbW9vbmRhc2gnLCAnbmdNb2NrRTJFJ10pKSk7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gTW9vbmRhc2hNb2NrcygpIHtcbiAgdGhpcy5tb2NrcyA9IHt9O1xuXG4gIHRoaXMuJGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbW9ja3MgPSB0aGlzLm1vY2tzO1xuICAgIHJldHVybiB7XG4gICAgICByZWdpc3Rlck1vY2tzOiBmdW5jdGlvbiAoJGh0dHBCYWNrZW5kKSB7XG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciBhbGwgdGhlIHJlZ2lzdGVyZWQgbW9ja3MgYW5kIHJlZ2lzdGVyIHRoZW1cbiAgICAgICAgXy5tYXAobW9ja3MsIGZ1bmN0aW9uIChtb2R1bGVNb2Nrcykge1xuICAgICAgICAgIF8obW9kdWxlTW9ja3MpLmZvckVhY2goZnVuY3Rpb24gKG1vY2spIHtcbiAgICAgICAgICAgIC8vIE1ha2UgbWV0aG9kIGFuZCByZXNwb25kZXIgb3B0aW9uYWxcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBtb2NrLm1ldGhvZCA/IG1vY2subWV0aG9kIDogJ0dFVCcsXG4gICAgICAgICAgICAgIGdlbmVyaWNSZXNwb25kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFsyMDAsIG1vY2sucmVzcG9uc2VEYXRhXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciByZXNwb25kZXIgPSBtb2NrLnJlc3BvbmRlciA/IG1vY2sucmVzcG9uZGVyIDogZ2VuZXJpY1Jlc3BvbmRlcjtcblxuICAgICAgICAgICAgJGh0dHBCYWNrZW5kLndoZW4obWV0aG9kLCBtb2NrLnBhdHRlcm4pXG4gICAgICAgICAgICAgIC5yZXNwb25kKHJlc3BvbmRlcik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgdGhpcy5hZGRNb2NrcyA9IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgdGhpcy5tb2Nrc1trXSA9IHY7XG4gIH07XG59XG5cblxuYW5ndWxhci5tb2R1bGUoXCJtb29uZGFzaFwiKVxuICAucHJvdmlkZXIoJ21vb25kYXNoTW9ja1Jlc3QnLCBNb29uZGFzaE1vY2tzKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIl19
