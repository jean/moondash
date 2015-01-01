'use strict';

var
  LayoutService = require('../../services').LayoutService,
  layout,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Layout Service Setup', function () {

  var $rootScope, MdConfig, evt;

  beforeEach(function () {
    MdConfig = {
      site: {
        name: 'Site Title'
      }
    };
    $rootScope = {
      '$on': stub()
    };
    evt = stub();
  });

  it('should have basic API', function () {
    layout = new LayoutService($rootScope, MdConfig);
    expect(layout.pageTitle).to.equal('Site Title');
  });

  it('should change the title on state change with title', function () {
    layout = new LayoutService($rootScope, MdConfig);
    var toState = {title: 'State Name'};
    layout.changeTitle(evt, toState);
    expect(layout.pageTitle).to.equal('Site Title - State Name');
  });

  it('should not change the title on state change without title', function () {
    layout = new LayoutService($rootScope, MdConfig);
    var toState = {};
    layout.changeTitle(evt, toState);
    expect(layout.pageTitle).to.equal('Site Title');
  });

});
