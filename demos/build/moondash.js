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
require('./auth');
require('./layout');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./auth":2,"./layout":5}],2:[function(require,module,exports){
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
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

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
  .controller('HeaderCtrl', HeaderCtrl);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
'use strict';

require('./controllers');
require('./states');

},{"./controllers":4,"./states":6}],6:[function(require,module,exports){
function ModuleInit($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/md-layout.partial.html'
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 templateUrl: '/layout/md-header.partial.html',
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-leftbar': {
                 templateUrl: '/layout/md-leftbar.partial.html'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwic3JjL2F1dGgvaW5kZXguanMiLCJzcmMvYXV0aC90d2l0dGVyL2luZGV4LmpzIiwic3JjL2xheW91dC9jb250cm9sbGVycy5qcyIsInNyYy9sYXlvdXQvaW5kZXguanMiLCJzcmMvbGF5b3V0L3N0YXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4ndXNlIHN0cmljdCc7XG5cbi8qXG5cbiBEZWNsYXJlIHRoZSBtb2R1bGUgd2l0aCBkZXBlbmRlbmNpZXMsIGFuZCBub3RoaW5nIG1vcmUuXG5cbiBJZiBydW5uaW5nIGluIFwiZGV2ZWxvcG1lbnQgbW9kZVwiLCBpbmplY3QgdGhlIG1vY2sgaW5mcmFzdHJ1Y3R1cmUuXG5cbiAqL1xuXG52YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcsIFsndWkucm91dGVyJ10pO1xuXG4vLyBOb3cgdGhlIE1vb25kYXNoIGNvbXBvbmVudHNcbnJlcXVpcmUoJy4vYXV0aCcpO1xucmVxdWlyZSgnLi9sYXlvdXQnKTtcblxuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciB0d2l0dGVyID0gcmVxdWlyZShcIi4vdHdpdHRlclwiKTtcblxudmFyIGxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJQbGVhc2UgbG9naW5cIik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsb2dpbjogbG9naW4sXG4gICAgdHdpdHRlcjogdHdpdHRlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBsb2dpbiA9IGZ1bmN0aW9uICgpIHtcbiAgY29uc29sZS5sb2coXCJQbGVhc2UgbG9naW4gdXNpbmcgVHdpdHRlclwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbG9naW46IGxvZ2luXG59OyIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBIZWFkZXJDdHJsKCRzdGF0ZSkge1xuICB0aGlzLnNlY3Rpb25zID0gXygkc3RhdGUuZ2V0KCkpXG4gICAgLmZpbHRlcihmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF8uaGFzKHN0YXRlLCBcInNlY3Rpb25cIik7XG4gICAgICAgICAgICB9KVxuICAgIC5tYXAoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgIHZhciBzID0gc3RhdGUuc2VjdGlvbjtcbiAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICB0aXRsZTogcy50aXRsZSxcbiAgICAgICAgICAgICBzdGF0ZTogc3RhdGUubmFtZVxuICAgICAgICAgICB9O1xuICAgICAgICAgfSlcbiAgICAvLy5zb3J0QnkoXCJwcmlvcml0eVwiKVxuICAgIC52YWx1ZSgpO1xufVxuYW5ndWxhci5tb2R1bGUoJ21vb25kYXNoJylcbiAgLmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBIZWFkZXJDdHJsKTtcbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbiIsImZ1bmN0aW9uIE1vZHVsZUluaXQoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2xheW91dCcsIHtcbiAgICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtbGF5b3V0LnBhcnRpYWwuaHRtbCdcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWhlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICcvbGF5b3V0L21kLWhlYWRlci5wYXJ0aWFsLmh0bWwnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSGVhZGVyQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1sZWZ0YmFyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJy9sYXlvdXQvbWQtbGVmdGJhci5wYXJ0aWFsLmh0bWwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IHVpLXZpZXc9XCJtZC1jb250ZW50XCI+PC9kaXY+J1xuICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICdtZC1mb290ZXInOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnL2xheW91dC9tZC1mb290ZXIucGFydGlhbC5odG1sJ1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtb29uZGFzaCcpXG4gIC5jb25maWcoTW9kdWxlSW5pdCk7Il19
