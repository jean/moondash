'use strict';

var
  SchemasService = require('../../services').SchemasService,
  schemas,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Schemas Service Setup', function () {

  var sampleSchemas;

  beforeEach(function () {
    sampleSchemas = {
      0: {flag: 0},
      1: {flag: 1}
    };
  });

  it('should have basic API', function () {
    schemas = new SchemasService();
    expect(schemas.schemas).to.be.a('object');
    expect(schemas.schemas).to.be.empty();
    expect(schemas.get).to.exist();
    expect(schemas.init).to.exist();
  });

  it('should have init the schemas from JSON', function () {
    schemas = new SchemasService();
    schemas.init(sampleSchemas);
    expect(schemas.schemas).to.not.be.empty();
    expect(schemas.schemas[0].flag).to.equal(0);
    expect(schemas.schemas[1].flag).to.equal(1);
  });


  it('should have get a schema', function () {
    schemas = new SchemasService();
    schemas.init(sampleSchemas);
    expect(schemas.get(0).flag).to.equal(0);
    expect(schemas.get(1).flag).to.equal(1);
  });

});
