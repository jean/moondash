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
    mrt,
    prefix = '/api';

  describe('Basics', function () {

    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType('/api', 'invoices', items);
    });

    it('should provide basic instance', function () {
      expect(mrt).to.exist();
      expect(mrt.prefix).to.equal('/api');
      expect(mrt.id).to.equal('invoices');
      expect(mrt.items).to.be.a('object');
      expect(mrt.items).to.not.be.empty();
      expect(mrt.items['item1'].id).to.equal('item1');
    });

    it('should provide basic instance with no items', function () {
      mrt = new MockResourceType('/api', 'invoices');
      expect(mrt).to.exist();
      expect(mrt.prefix).to.equal('/api');
      expect(mrt.id).to.equal('invoices');
      expect(mrt.items).to.be.a('object');
      expect(mrt.items).to.be.empty();
    });

  });

  describe('Default Collection Actions', function () {

    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType(prefix, 'invoices', items);
    });

    it('should perform a READ action', function () {
      var result = mrt.collectionREAD();
      expect(result.id).to.equal('invoices');
      expect(result.items).to.be.undefined();
    });

    it('should perform a LIST action', function () {
      var result = mrt.collectionLIST();
      expect(result[0].id).to.equal('item1');
    });

    it('should perform an UPDATE action', function () {
      mrt.title = 'Before Title';
      mrt.description = 'Before Description';
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var result = mrt.collectionUPDATE({json_body: json_body});
      expect(result).to.be.null();
      expect(mrt.title).to.equal('After Title');
      expect(mrt.description).to.equal('After Description');
    });

    it('should perform an REPLACE action', function () {
      mrt.title = 'Before Title';
      mrt.description = 'Before Description';
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var result = mrt.collectionREPLACE({json_body: json_body});
      expect(result).to.be.null();
      expect(mrt.title).to.equal('After Title');
      expect(mrt.description).to.equal('After Description');
    });

  });

  describe('Default Document Actions', function () {

    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType(prefix, 'invoices', items);
    });

    it('should perform a READ action', function () {
      var request = {pathname: '/api/invoices/item1'};
      var result = mrt.documentREAD(request);
      expect(result.id).to.equal('item1');
      expect(result.items).to.be.undefined();
    });

  });

  describe('List Mocks for MockRest registrations', function () {

    it('should provide list of collection/resource mocks', function () {
      var result = mrt.listMocks();
      var regex = '/\\/api\\/invoices\\/items/';
      expect(result[0].pattern.toString()).to.equal(regex);
      expect(result[0].responder).to.be.a('function');
    });

  });

  describe('Make Pattern Regexes', function () {

    var makePatternRegExp = require('../../mock_resource_type').makePatternRegExp;

    it('should make a compatible regex', function () {
      var result = makePatternRegExp('somePrefix', 'someId', 'someSuffix');
      expect(result.toString()).to.equal('/somePrefix\\/someId\\/someSuffix/');
    });

    it('should handle missing optional suffix', function () {
      var result = makePatternRegExp('somePrefix', 'someId');
      expect(result.toString()).to.equal('/somePrefix\\/someId/');
    });

  });

  describe('Get Documents from Collections', function () {

    beforeEach(function () {
      var items = {'item1': {id: 'item1', resource_type: 'invoice'}};
      mrt = new MockResourceType(prefix, 'invoices', items);
    });

    it('should find a document', function () {
      var pathname = '/api/invoices/item1';
      var result = mrt.getDocument(pathname);
      expect(result.id).to.equal('item1');
    });

    it('should throw an HTTPNotFound', function () {
      var pathname = '/api/invoices/xxx';
      expect(function () {
        mrt.getDocument(pathname)
      }).to.throw('No document at: /api/invoices/xxx');
    });

  });


});
