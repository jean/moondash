'use strict';

var _ = require('lodash');

function MockRest() {
  var _this = this;
  this.mocks = {};

  this.$get = function () {
    var mocks = this.mocks;
    return {
      registerMocks: registerMocks
    };
  };

  this.addMocks = function (k, v) {
    this.mocks[k] = v;
  };

  function registerMocks($httpBackend) {
    // Iterate over all the registered mocks and register them
    _.map(_this.mocks, function (moduleMocks) {
      _(moduleMocks).forEach(function (mock) {

        // To register with $httpBackend's matchers, we need two things
        // from the mock: the method and the URL pattern.
        var method = mock.method || 'GET',
          pattern = mock.pattern;

        var wrappedResponder = function (method, url, data, headers) {
          return dispatch(mock, method, url, data, headers);
        };

        $httpBackend.when(method, pattern)
          .respond(wrappedResponder);
      });
    });
  }

  function dispatch(mock, method, url, data, headers) {
    // Called by $httpBackend whenever this mock's pattern is matched
    var responder = mock.responder,
      responseData = mock.responseData;

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
  }
}


angular.module("moondash")
  .provider('MdMockRest', MockRest);
