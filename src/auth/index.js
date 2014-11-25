'use strict';

var twitter = require("./twitter");

var login = function() {
    console.log("Please login");
}

module.exports = {
    login: login,
    twitter: twitter,
    templates: [
        "html/index.html",
        "**/*.html"
    ]
}