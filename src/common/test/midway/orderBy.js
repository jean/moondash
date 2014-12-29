'use strict';

describe('OrderByFilter', function () {

  var items = [
    {id: 1, priority: 2},
    {id: 2, priority: 1}
  ];

  beforeEach(function () {
    module('md.common');
  });

  it('has a filter', inject(function ($filter) {
    expect($filter('mdOrderObjectBy')).not.toBeNull();
  }));

  it("should return ascending ", inject(function (mdOrderObjectByFilter) {
    var result = mdOrderObjectByFilter(items, 'priority');
    expect(result[0].id).toBe(2);
  }));

  it("should return descending ", inject(function (mdOrderObjectByFilter) {
    var result = mdOrderObjectByFilter(items, 'priority', true);
    expect(result[0].id).toBe(1);
  }));


});