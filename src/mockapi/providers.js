'use strict';

function MoondashMocks() {
  this.mocks = {};

  this.$get = function () {
    var mocks = this.mocks;
    return {
      getMocks: function () {
        return mocks;
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
