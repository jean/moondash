'use strict';

var
  DispatcherService = require('../../services').Dispatcher,
  dispatcher,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Dispatcher Service Setup', function () {

  var
    sampleState = {
      name: 'invoice.default',
      viewConfig: {
        name: 'default',
        resourceType: 'Invoice',
        containment: 'someParent',
        pathInfo: 'somePathInfo',
        marker: 'someMarker'
      }
    };


  beforeEach(function () {
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
    var viewName = 'default';
    dispatcher.addStateToViewMap(sampleState);
    expect(dispatcher.viewMap[viewName]).to.be.a('array');
    var view = dispatcher.viewMap[viewName][0];
    expect(view).to.be.a('object');

    // Ensure the info was extracted
    expect(view.name).to.equal(viewName);
    expect(view.resourceType).to.equal('Invoice');
    expect(view.stateName).to.equal('invoice.default');
    expect(view.containment).to.equal('someParent');
    expect(view.pathInfo).to.equal('somePathInfo');
    expect(view.marker).to.equal('someMarker');
  });

  it('should add a state via makeViewMap', function () {
    var states = [sampleState];
    dispatcher.makeViewMap(states);
    expect(dispatcher.viewMap).to.not.be.empty();
    expect(dispatcher.disableDispatch).to.false();
  });

  it('should NOT add a bad state to the map', function () {
    var badState = {
      name: 'invoice.default'
    };
    dispatcher.addStateToViewMap(badState);
    expect(dispatcher.viewMap).to.be.empty();
  });

  it("should NOT make a viewMap (check disableDispatch true)", function () {
    var states = [
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    expect(dispatcher.disableDispatch).to.be.true();
    expect(dispatcher.viewMap).to.be.empty();
  });

});

describe('Dispatcher Service View Resolution', function () {

  beforeEach(function () {
    dispatcher = new DispatcherService();
  });

  it("should select a view - no resourceType", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview1',
        viewConfig: {name: 'default'}
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview');
    expect(views[1].stateName).to.equal('folderview1');
  });

  it("should select a view - no resourceType + marker", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview1',
        viewConfig: {name: 'default'}
      },
      {
        name: 'folderview2',
        viewConfig: {name: 'default', marker: 'marker1'}
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview2');
    expect(views[1].stateName).to.equal('folderview');
    expect(views[2].stateName).to.equal('folderview1');
  });

  it("should select a view - best match ordering with marker", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-marker');
    expect(views[1].stateName).to.equal('folderview');
  });

  it("should select a view - best match ordering with containment", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-containment');
    expect(views[1].stateName).to.equal('folderview');
  });

  it("should select a view - containment AND marker - simple case", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {
        name: 'folderview-containment-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-containment-marker');
    expect(views[1].stateName).to.equal('folderview-containment');
    expect(views[2].stateName).to.equal('folderview');
  });

  it("should select a view - containment AND marker - complex case", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {
        name: 'folderview-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];

    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-marker');
    expect(views[1].stateName).to.equal('folderview-containment');
    expect(views[2].stateName).to.equal('folderview');
  });

  it("should make a view map - bug #1", function () {
    // the very first version of viewMap algorithm suffers a problem
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {resourceType: 'f2', name: 'default'}
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-4',
        viewConfig: {resourceType: 'f3', name: 'default'}
      },
      {
        name: 'folderview-5',
        viewConfig: {
          resourceType: 'f3',
          name: 'default',
          containment: 'c1'
        }
      }
    ];

    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-3');
    expect(views[1].stateName).to.equal('folderview-5');
    expect(views[2].stateName).to.equal('folderview-1');
    expect(views[3].stateName).to.equal('folderview-2');
    expect(views[4].stateName).to.equal('folderview-4');
  });

  it("should make a view map - bug #2", function () {
    // the very first version of viewMap algorithm suffers a problem
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
    ];


    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-2');
    expect(views[1].stateName).to.equal('folderview-3');
    expect(views[2].stateName).to.equal('folderview-1');
  });


  it("should make a view map - pathInfo bug", function () {
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-4',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1',
          pathInfo: 'f/'
        }
      }
    ];


    dispatcher.makeViewMap(states);
    var views = dispatcher.viewMap.default;
    // Find the more specific one first
    expect(views[0].stateName).to.equal('folderview-4');
    expect(views[1].stateName).to.equal('folderview-2');
    expect(views[2].stateName).to.equal('folderview-3');
    expect(views[3].stateName).to.equal('folderview-1');
  });

});

describe('Dispatcher Service Resolve States', function () {

  var toState;

  beforeEach(function () {
    dispatcher = new DispatcherService();
  });

  it("no available state (missing view)", function () {
    var states = [
      {name: 'state1', viewConfig: {name: 'default'}}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1'};
    toState = dispatcher.resolveState(context, 'aview');
    expect(toState).to.be.undefined();
  });

  it("should choose the highest precedence (just one state)", function () {
    var states = [
      {name: 'state1', viewConfig: {name: 'default'}}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1'};
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('state1');
  });

  it("should choose the highest precedence (no marker interface)", function () {
    var states = [
      {name: 'state1', viewConfig: {name: 'default'}},
      {
        name: 'state2',
        viewConfig: {name: 'default', marker: 'somemarker'}
      }
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1'};
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('state1');
  });

  it("should choose the highest precedence (with marker interface)", function () {
    var states = [
      {name: 'state1', viewConfig: {name: 'default'}},
      {
        name: 'state2',
        viewConfig: {name: 'default', marker: 'somemarker'}
      }
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', markers: ['somemarker']};
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('state2');
  });

  it("should choose the highest precedence (special case - no resourceType match)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview1',
        viewConfig: {name: 'default'}
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'MyFolder'};
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('folderview1');
  });

  it("should choose the highest precedence (special case - resourceType match)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview1',
        viewConfig: {name: 'default'}
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'folder'};
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('folderview');
  });

  it("should choose the highest precedence (special case - resourceType match but marker has higher priority)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview1',
        viewConfig: {name: 'default'}
      },
      {
        name: 'folderview2',
        viewConfig: {name: 'default', marker: 'marker1'}
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'folder',
      markers: ['marker1']
    };
    toState = dispatcher.resolveState(context, 'default');
    expect(toState).to.equal('folderview2');
  });

  it("should choose the highest precedence (special case - containment)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'folder'};
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'rootfolder'}]);
    expect(toState).to.equal('folderview-containment');
  });

  it("should choose the highest precedence (special case - containment with ancestor)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'folder'};
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'rootfolder'}, {resourceType: 'afolder'}]);
    expect(toState).to.equal('folderview-containment');
  });

  it("should choose the highest precedence (special case - containment AND marker - simple case)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {
        name: 'folderview-containment-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'folder',
      markers: ['somemarker']
    };
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'rootfolder'}]);
    expect(toState).to.equal('folderview-containment-marker');
  });

  it("should choose the highest precedence (special case - containment AND no marker match - simple case)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {
        name: 'folderview-containment-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'folder',
      markers: ['othermarker']
    };
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'rootfolder'}]);
    expect(toState).to.equal('folderview-containment');
  });

  it("should choose the highest precedence (special case - marker match > containment match)", function () {
    var states = [
      {
        name: 'folderview',
        viewConfig: {resourceType: 'folder', name: 'default'}
      },
      {
        name: 'folderview-containment',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          containment: 'rootfolder'
        }
      },
      {
        name: 'folderview-marker',
        viewConfig: {
          resourceType: 'folder',
          name: 'default',
          marker: 'somemarker'
        }
      },
      {name: 'some.route'}
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'folder',
      markers: ['somemarker']
    };
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'rootfolder'}]);
    expect(toState).to.equal('folderview-marker');
  });

  it("should choose the highest precedence (bug 1 case)", function () {
    // the very first version of viewMap algorithm suffers a problem
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {resourceType: 'f2', name: 'default'}
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-4',
        viewConfig: {resourceType: 'f3', name: 'default'}
      },
      {
        name: 'folderview-5',
        viewConfig: {
          resourceType: 'f3',
          name: 'default',
          containment: 'c1'
        }
      }
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'f3'};
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'c1'}]);
    expect(toState).to.equal('folderview-5');
  });

  it("should choose the highest precedence (bug 2 case - containment match)", function () {
    // the very first version of viewMap algorithm suffers a problem
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
    ];
    dispatcher.makeViewMap(states);
    var context = {title: 'Context 1', resourceType: 'f1'};
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'c1'}]);
    expect(toState).to.equal('folderview-3');
  });

  it("should choose the highest precedence (bug 2 case - marker and containment match)", function () {
    // the very first version of viewMap algorithm suffers a problem
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'f1',
      markers: ['marker1', 'm1']
    };
    toState = dispatcher.resolveState(context, 'default', [{resourceType: 'c1'}]);
    expect(toState).to.equal('folderview-2');
  });

});


describe("Resolve states (parentTypes markers)", function () {

  it("should choose the highest precedence (containment parent markers match)", function () {
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      }
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'f1',
      markers: ['othermarker']
    };
    var toState = dispatcher.resolveState(context, 'default', [{
      resourceType: 'c1',
      markers: ['m1']
    }]);
    expect(toState).to.equal('folderview-2');
  });
});

describe("Resolve states (pathInfo)", function () {

  it("should choose the highest precedence (more specific path info)", function () {
    var states = [
      {
        name: 'folderview-1',
        viewConfig: {resourceType: 'f1', name: 'default'}
      },
      {
        name: 'folderview-2',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-3',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          containment: 'c1'
        }
      },
      {
        name: 'folderview-4',
        viewConfig: {
          resourceType: 'f1',
          name: 'default',
          marker: 'm1',
          containment: 'c1',
          pathInfo: '/f'
        }
      }
    ];
    dispatcher.makeViewMap(states);
    var context = {
      title: 'Context 1',
      resourceType: 'f1',
      path: '/f/f1',
      markers: ['othermarker']
    };
    var toState = dispatcher.resolveState(context, 'default', [{
      resourceType: 'c1',
      markers: ['m1']
    }]);
    expect(toState).to.equal('folderview-4');
  });
});
