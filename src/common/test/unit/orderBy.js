'use strict';

var
  chai = require('chai'),
  expect = chai.expect,
  OrderByModule = require('../../filters'),
  OrderByFilter = OrderByModule.OrderObjectByFilter;

describe('Order By Filter', function () {

  var filter;

  beforeEach(function () {
    filter = OrderByFilter();
  });

  it('should sort mapping items ascending', function () {
    var items = [
      {id: 1, priority: 2},
      {id: 2, priority: 1},
      {id: 3, priority: 99}
    ];
    var result = filter(items, 'priority');
    expect(result[0].id).to.equal(2);
    expect(result[1].id).to.equal(1);
    expect(result[2].id).to.equal(3);
  });

  it('should sort mapping items descending', function () {
    var items = [
      {id: 1, priority: 2},
      {id: 2, priority: 1},
      {id: 3, priority: 99}
    ];
    var result = filter(items, 'priority', true);
    expect(result[0].id).to.equal(3);
    expect(result[1].id).to.equal(1);
    expect(result[2].id).to.equal(2);
  });

});
