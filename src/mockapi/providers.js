'use strict';

var _ = require('lodash');

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
            var method = mock.method,
              responder = mock.responder;

            // If there is no method listed, default to GET
            if (!method) {
              method = 'GET';
              // If there is no responder listed, provide a sample
              if (!responder) {
                responder = function () {
                  return [200, mock.responseData];
                }
              }
            }

            // Handle mocks with authenticate:true. Do so by wrapping the
            // actual responder with one that first checks for the header.
            var wrappedResponder = responder;
            if (mock.authenticate) {
              wrappedResponder = function (method, url, data, headers) {
                if (_(headers).has('Authorization')) {
                  // We are authenticated, return original responder
                  return responder(method, url, data, headers);
                } else {
                  // Return a generic challenge
                  return [401, {"message": "Login required"}];
                }
              }
            }

            // Forbidden errors can't be mocked, as we don't have,
            // in-browser, an easy way to unpack the JWT and validate
            // the user.

            $httpBackend.when(method, mock.pattern)
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
