'use strict';

var hello = require('./directives');
var login = function () {
  console.log("Please login using Twitter");
};
module.exports = {
  login: login
};