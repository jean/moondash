'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

var
  controllers = require('../../controllers'),
  ctrl,
  result;

describe('Forms Form Controller', function () {

  var MdSchemas, MdForms, model, form, schema;

  beforeEach(function () {
    ctrl = controllers.FormController;
    model = {flag: 9};
    form = {flag: 9};
    schema = {flag: 9};
    MdSchemas = {
      get: function () {
        return form
      }
    };
    MdForms = {
      get: function () {
        return schema
      }
    };
  });

  it('should have assign model, schema, and form', function () {
    result = new ctrl(MdSchemas, MdForms);
    // Simulate the directive jamming on an attribute
    // via bindToController
    result.model = model;
    expect(result.model.flag).to.equal(9);
    expect(result.schema.flag).to.equal(9);
    expect(result.form.flag).to.equal(9);
    // Change the values, expect a change
    model.flag = 8;
    schema.flag = 8;
    form.flag = 8;
    expect(result.model.flag).to.equal(8);
    expect(result.schema.flag).to.equal(8);
    expect(result.form.flag).to.equal(8);
  });

});
