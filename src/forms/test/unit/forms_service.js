'use strict';

var
  FormsService = require('../../services').FormsService,
  forms,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Forms Service Setup', function () {

  var sampleForms;

  beforeEach(function () {
    sampleForms = {
      0: {flag: 0},
      1: {flag: 1}
    };
  });

  it('should have basic API', function () {
    forms = new FormsService();
    expect(forms.forms).to.be.a('object');
    expect(forms.forms).to.be.empty();
    expect(forms.get).to.exist();
    expect(forms.init).to.exist();
  });

  it('should have init the forms from JSON', function () {
    forms = new FormsService();
    forms.init(sampleForms);
    expect(forms.forms).to.not.be.empty();
    expect(forms.forms[0].flag).to.equal(0);
    expect(forms.forms[1].flag).to.equal(1);
  });


  it('should have get a form', function () {
    forms = new FormsService();
    forms.init(sampleForms);
    expect(forms.forms[0].flag).to.equal(0);
    expect(forms.forms[1].flag).to.equal(1);
  });

});
