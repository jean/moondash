'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

describe('mockapi MockResourceType', function () {

  var
    MockResourceType = require('../../mock_resource_type').MockResourceType,
    exceptions = require('../../exceptions'),
    mrt;

  describe('Basics', function () {

    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType('/api/resourcetypes', 'invoices', items);
    });

    it('should provide basic instance', function () {
      expect(mrt).to.exist();
      expect(mrt.prefix).to.equal('/api/resourcetypes');
      expect(mrt.id).to.equal('invoices');
      expect(mrt.items).to.be.a('object');
      expect(mrt.items).to.not.be.empty();
      expect(mrt.items['item1'].id).to.equal('item1');
    });

    it('should provide basic instance with no items', function () {
      mrt = new MockResourceType('/api/resourcetypes', 'invoices');
      expect(mrt).to.exist();
      expect(mrt.prefix).to.equal('/api/resourcetypes');
      expect(mrt.id).to.equal('invoices');
      expect(mrt.items).to.be.a('object');
      expect(mrt.items).to.be.empty();
    });

  });

  describe('Default Collection Actions', function () {
    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType('/api/resourcetypes', 'invoices', items);
    });

    it('should perform a READ action', function () {
      var result = mrt.collectionREAD();
      expect(result.id).to.equal('invoices');
      expect(result.items).to.be.undefined();
    });

    it('should perform a LIST action', function () {
      var result = mrt.collectionLIST();
      expect(result.item1.id).to.equal('item1');
    });

  });

});
