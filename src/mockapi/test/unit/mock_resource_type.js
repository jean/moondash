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
    prefix = '/api/resourcetypes';

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
      mrt = new MockResourceType(prefix, 'invoices', items);
    });

    it('should perform a READ action', function () {
      var result = mrt.collectionRead();
      expect(result.id).to.equal('invoices');
      expect(result.items).to.be.undefined();
    });

    it('should perform a LIST action', function () {
      var result = mrt.collectionList();
      expect(result[0].id).to.equal('item1');
    });

    it('should perform an UPDATE action', function () {
      mrt.title = 'Before Title';
      mrt.description = 'Before Description';
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var result = mrt.collectionUpdate({json_body: json_body});
      expect(result).to.be.null();
      expect(mrt.title).to.equal('After Title');
      expect(mrt.description).to.equal('After Description');
    });

    it('should perform a Create action', function () {
      var json_body = {
        id: '1',
        title: 'New Invoice'
      };
      var result = mrt.collectionAdd({json_body: json_body});
      expect(result.location).to.equal('/api/resourcetypes/invoices/1');
      var newItem = mrt.items['1'];
      expect(newItem.id).to.equal('1');
      expect(newItem.title).to.equal('New Invoice');
    });

    it('should perform a REPLACE action', function () {
      mrt.title = 'Before Title';
      mrt.description = 'Before Description';
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var result = mrt.collectionReplace({json_body: json_body});
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
      var request = {pathname: '/api/resourcetypes/invoices/item1'};
      var result = mrt.documentRead(request);
      expect(result.id).to.equal('item1');
      expect(result.items).to.be.undefined();
    });

    it('should perform a DELETE action', function () {
      var request = {pathname: '/api/resourcetypes/invoices/item1'};
      var result = mrt.documentDelete(request);
      expect(result).to.be.null();
      expect(mrt.items).to.be.empty();
    });

    it('should perform an UPDATE action', function () {
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var request = {
        pathname: '/api/resourcetypes/invoices/item1',
        json_body: json_body
      };
      var result = mrt.documentUpdate(request);
      expect(result).to.be.null();
      expect(mrt.items.item1.title).to.equal('After Title');
      expect(mrt.items.item1.description).to.equal('After Description');
    });

    it('should perform a REPLACE action', function () {
      var json_body = {
        title: 'After Title',
        description: 'After Description'
      };
      var request = {
        pathname: '/api/resourcetypes/invoices/item1',
        json_body: json_body
      };
      var result = mrt.documentReplace(request);
      expect(result).to.be.null();
      expect(mrt.items.item1.title).to.equal('After Title');
      expect(mrt.items.item1.description).to.equal('After Description');
    });

  });

  describe('List Mocks for MockRest registrations', function () {

    it('should provide list of collection/resource mocks', function () {
      var result = mrt.listMocks();
      var regex = '/\\/api\\/resourcetypes\\/invoices\\/items/';
      expect(result[0].pattern.toString()).to.equal(regex);
      expect(result[0].responder).to.be.a('function');
    });

  });

  describe('Extract the resource ID from various patterns', function () {

    beforeEach(function () {
      mrt = new MockResourceType(prefix, 'invoices');
    });

    it('should find the ID in a basic pathname', function () {
      var pathname = '/api/resourcetypes/invoices/1';
      expect(mrt.getId(pathname)).to.equal('1');
    });

    it('should find ID in pathname with trailing slash', function () {
      var pathname = '/api/resourcetypes/invoices/1/';
      expect(mrt.getId(pathname)).to.equal('1');
    });

    it('should find ID in deeply nested pathname', function () {
      var pathname = '/api/resourcetypes/and/more/resourcetypes/invoices/1/';
      mrt = new MockResourceType('/api/resourcetypes/and/more/resourcetypes', 'invoices');
      expect(mrt.getId(pathname)).to.equal('1');
    });

    it('should find ID in pathname with extra action', function () {
      var pathname = '/api/resourcetypes/invoices/1/someAction';
      expect(mrt.getId(pathname)).to.equal('1');
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
      var pathname = '/api/resourcetypes/invoices/item1';
      var result = mrt.getDocument(pathname);
      expect(result.id).to.equal('item1');
    });

    it('should throw an HTTPNotFound', function () {
      var pathname = '/api/resourcetypes/invoices/xxx';
      expect(function () {
        mrt.getDocument(pathname)
      }).to.throw('No document at: /api/resourcetypes/invoices/xxx');
    });

  });


});
