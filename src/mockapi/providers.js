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
          // All the mocks registered for this module
          _(moduleMocks).forEach(function (mock) {
            $httpBackend.when(
              mock.method,
              mock.pattern)
              .respond(mock.responder);
          });
        });
      }
    };
  };

  this.addMock = function (k, v) {
    this.mocks[k] = v;
  };
}

function ModuleInit() {
  /* Empty for now */
}

angular.module("moondash")
  .provider('moondashMockRest', MoondashMocks)
  .config(ModuleInit);
