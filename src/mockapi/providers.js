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
