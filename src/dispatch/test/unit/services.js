'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Dispatcher Service', function () {

  var DispatcherService, dispatcher;

  beforeEach(function () {
    DispatcherService =  require('../../services').Dispatcher;
    dispatcher = new DispatcherService();
  });

  it('should have basic API', function () {
    expect(dispatcher.viewMap).to.exist();
    expect(dispatcher.resetViewMap).to.exist();
    expect(dispatcher.addStateToViewMap).to.exist();
    expect(dispatcher.updateTraversal).to.exist();
    expect(dispatcher.orderViewMap).to.exist();
    expect(dispatcher.makeViewMap).to.exist();
    expect(dispatcher.resolveState).to.exist();
  });

  it('should reset the map', function () {
    dispatcher.viewMap = null;
    dispatcher.resetViewMap();
    expect(dispatcher.viewMap).to.be.a('object');
  });

  it('should add a state to the map', function () {
    var state = {
      name: 'invoice.default',
      viewConfig: {
        name: 'default',
        resourceType: 'Invoice',
        containment: 'someParent',
        pathInfo: 'somePathInfo',
        marker: 'someMarker'
      }
    };
    dispatcher.addStateToViewMap(state);
    expect(dispatcher.viewMap['default']).to.be.a('array');
  });

  it('should NOT add a state to the map', function () {
    var state = {
      name: 'invoice.default'
    };
    dispatcher.addStateToViewMap(state);
    expect(dispatcher.viewMap).to.be.empty();
  });

});
