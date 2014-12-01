(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

/*

 Declare the module with dependencies, and nothing more.

 If running in "development mode", inject the mock infrastructure.

 */

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('moondash', ['ui.router']);

// Now the Moondash components
require('./layout');
require('./globalsection');
require('./auth');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":2,"./globalsection":4,"./layout":7}],2:[function(require,module,exports){
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

require('./states');

},{"./states":5}],5:[function(require,module,exports){
function ModuleInit($stateProvider) {
  $stateProvider
    .state('root.dashboard', {
             url: '/dashboard',
             views: {
               'md-content@root': {
                 template: '<h2>Dashboard</h2>'
               }
             }
           })
    .state('root.settings', {
             url: '/settiings',
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
    .state('root.types.people', {
             url: '/types',
             views: {
               'md-content@root': {
                 template: '<h2>People</h2>'
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
},{}],6:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function SectionsCtrl(MdSections) {
  this.sections = MdSections.sections;
}

function HeaderCtrl($state) {
  this.sections = _($state.get())
    .filter(function (state) {
              return _.has(state, "section");
            })
    .map(function (state) {
           var s = state.section;
           return {
             title: s.title,
             state: state.name
           };
         })
    //.sortBy("priority")
    .value();
}
angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');
require('./services');

},{"./controllers":6,"./services":8,"./states":9}],8:[function(require,module,exports){
function MdLayoutService() {

}
function MdSectionsService() {
  this.sections = [
    {
      label: false,
      items: [
        {
          label: "Dashboard", state: "root.dashboard"
        },
        {
          label: "Settings", state: "root.settings"
        }
      ]
    },
    {
      label: "Types",
      items: [
        {
          label: "People", state: "root.types.people"
        },
        {
          label: "Invoices", state: "root.types.invoices"
        }
      ]
    }
  ]
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .service('MdSections', MdSectionsService);

},{}],9:[function(require,module,exports){
function ModuleInit($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/md-layout.partial.html',
               controller: "LayoutCtrl"
           })
    .state('root', {
             parent: 'layout',
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2F1dGgvaW5kZXguanMiLCJzcmMvYXV0aC90d2l0dGVyL2luZGV4LmpzIiwic3JjL2dsb2JhbHNlY3Rpb24vaW5kZXguanMiLCJzcmMvZ2xvYmFsc2VjdGlvbi9zdGF0ZXMuanMiLCJzcmMvbGF5b3V0L2NvbnRyb2xsZXJzLmpzIiwic3JjL2xheW91dC9pbmRleC5qcyIsInNyYy9sYXlvdXQvc2VydmljZXMuanMiLCJzcmMvbGF5b3V0L3N0YXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuJ3VzZSBzdHJpY3QnO1xuXG4vKlxuXG4gRGVjbGFyZSB0aGUgbW9kdWxlIHdpdGggZGVwZW5kZW5jaWVzLCBhbmQgbm90aGluZyBtb3JlLlxuXG4gSWYgcnVubmluZyBpbiBcImRldmVsb3BtZW50IG1vZGVcIiwgaW5qZWN0IHRoZSBtb2NrIGluZnJhc3RydWN0dXJlLlxuXG4gKi9cblxudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnLCBbJ3VpLnJvdXRlciddKTtcblxuLy8gTm93IHRoZSBNb29uZGFzaCBjb21wb25lbnRzXG5yZXF1aXJlKCcuL2xheW91dCcpO1xucmVxdWlyZSgnLi9nbG9iYWxzZWN0aW9uJyk7XG5yZXF1aXJlKCcuL2F1dGgnKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHdpdHRlciA9IHJlcXVpcmUoXCIuL3R3aXR0ZXJcIik7XG5cbnZhciBsb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUGxlYXNlIGxvZ2luXCIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbG9naW46IGxvZ2luLFxuICAgIHR3aXR0ZXI6IHR3aXR0ZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbG9naW4gPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnNvbGUubG9nKFwiUGxlYXNlIGxvZ2luIHVzaW5nIFR3aXR0ZXJcIik7XG59O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvZ2luOiBsb2dpblxufTsiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG4iLCJmdW5jdGlvbiBNb2R1bGVJbml0KCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdyb290LmRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+RGFzaGJvYXJkPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC5zZXR0aW5ncycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvc2V0dGlpbmdzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+U2V0dGluZ3M8L2gyPidcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdyb290LnR5cGVzJywge1xuICAgICAgICAgICAgIHVybDogJy90eXBlcycsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGgyPlR5cGVzPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcy5wZW9wbGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3R5cGVzJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8aDI+UGVvcGxlPC9oMj4nXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncm9vdC50eXBlcy5pbnZvaWNlcycsIHtcbiAgICAgICAgICAgICB1cmw6ICcvaW52b2ljZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxoMj5JbnZvaWNlczwvaDI+J1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlSW5pdCk7IiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIExheW91dEN0cmwoJHJvb3RTY29wZSwgTWRMYXlvdXQpIHtcbiAgJHJvb3RTY29wZS5sYXlvdXQgPSBNZExheW91dDtcbn1cblxuZnVuY3Rpb24gU2VjdGlvbnNDdHJsKE1kU2VjdGlvbnMpIHtcbiAgdGhpcy5zZWN0aW9ucyA9IE1kU2VjdGlvbnMuc2VjdGlvbnM7XG59XG5cbmZ1bmN0aW9uIEhlYWRlckN0cmwoJHN0YXRlKSB7XG4gIHRoaXMuc2VjdGlvbnMgPSBfKCRzdGF0ZS5nZXQoKSlcbiAgICAuZmlsdGVyKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgICAgICByZXR1cm4gXy5oYXMoc3RhdGUsIFwic2VjdGlvblwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgdmFyIHMgPSBzdGF0ZS5zZWN0aW9uO1xuICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgIHRpdGxlOiBzLnRpdGxlLFxuICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZS5uYW1lXG4gICAgICAgICAgIH07XG4gICAgICAgICB9KVxuICAgIC8vLnNvcnRCeShcInByaW9yaXR5XCIpXG4gICAgLnZhbHVlKCk7XG59XG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29udHJvbGxlcignTGF5b3V0Q3RybCcsIExheW91dEN0cmwpXG4gIC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgSGVhZGVyQ3RybClcbiAgLmNvbnRyb2xsZXIoJ1NlY3Rpb25zQ3RybCcsIFNlY3Rpb25zQ3RybCk7XG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc3RhdGVzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG4iLCJmdW5jdGlvbiBNZExheW91dFNlcnZpY2UoKSB7XG5cbn1cbmZ1bmN0aW9uIE1kU2VjdGlvbnNTZXJ2aWNlKCkge1xuICB0aGlzLnNlY3Rpb25zID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiBmYWxzZSxcbiAgICAgIGl0ZW1zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogXCJEYXNoYm9hcmRcIiwgc3RhdGU6IFwicm9vdC5kYXNoYm9hcmRcIlxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiU2V0dGluZ3NcIiwgc3RhdGU6IFwicm9vdC5zZXR0aW5nc1wiXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiBcIlR5cGVzXCIsXG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6IFwiUGVvcGxlXCIsIHN0YXRlOiBcInJvb3QudHlwZXMucGVvcGxlXCJcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiBcIkludm9pY2VzXCIsIHN0YXRlOiBcInJvb3QudHlwZXMuaW52b2ljZXNcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICBdXG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5zZXJ2aWNlKCdNZExheW91dCcsIE1kTGF5b3V0U2VydmljZSlcbiAgLnNlcnZpY2UoJ01kU2VjdGlvbnMnLCBNZFNlY3Rpb25zU2VydmljZSk7XG4iLCJmdW5jdGlvbiBNb2R1bGVJbml0KCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdsYXlvdXQnLCB7XG4gICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLWxheW91dC5wYXJ0aWFsLmh0bWwnLFxuICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJMYXlvdXRDdHJsXCJcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWhlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLWhlYWRlci5wYXJ0aWFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSGVhZGVyQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1zZWN0aW9uc21lbnUnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xheW91dC9tZC1zZWN0aW9uc21lbnUucGFydGlhbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NlY3Rpb25zQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50Jzoge1xuICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiB1aS12aWV3PVwibWQtY29udGVudFwiPjwvZGl2PidcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAnbWQtZm9vdGVyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtZm9vdGVyLnBhcnRpYWwuaHRtbCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUluaXQpOyJdfQ==
