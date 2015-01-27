'use strict';

var angular = require('angular');

angular.module('md.common', [])
.filter('mdOrderObjectBy', require('./filters').OrderObjectByFilter);

// Jamming this on here. Patching String.prototype to add some
// utility functions that aren't in lodash (and I don't want to
// add 7Kb minified to get underscore.string.)

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.substring(0, str.length) === str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.substring(this.length - str.length, this.length) === str;
    };
}
