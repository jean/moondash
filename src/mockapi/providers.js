'use strict';

var _ = require('lodash');

function MockRest() {
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
  .provider('MdMockRest', MockRest);
