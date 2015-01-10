'use strict';

var
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;

describe('mockapi Exceptions', function () {

  var
    exc = require('../../exceptions');

  describe('Exception Basics', function () {

    it('should have Not Found', function () {
      expect(exc.HTTPNotFound).to.exist();
      expect(exc.HTTPNotFound).to.be.a('function');
      var e = new exc.HTTPNotFound();
      expect(e.name).to.equal('HTTPNotFound');
      expect(e.statusCode).to.equal(404);
      expect(e.message).to.equal('Not Found');
    });

    it('should have Not Found with a message', function () {
      var e = new exc.HTTPNotFound('x');
      expect(e.message).to.equal('x');
    });

    it('should have Unauthorized', function () {
      expect(exc.HTTPUnauthorized).to.exist();
      expect(exc.HTTPUnauthorized).to.be.a('function');
      var e = new exc.HTTPUnauthorized();
      expect(e.name).to.equal('HTTPUnauthorized');
      expect(e.statusCode).to.equal(401);
      expect(e.message).to.equal('Login Required');
    });

    it('should have Unauthorized with a message', function () {
      var e = new exc.HTTPUnauthorized('x');
      expect(e.message).to.equal('x');
    });

    it('should have No Content', function () {
      expect(exc.HTTPNoContent).to.exist();
      expect(exc.HTTPNoContent).to.be.a('function');
      var e = new exc.HTTPNoContent();
      expect(e.name).to.equal('HTTPNoContent');
      expect(e.statusCode).to.equal(204);
      expect(e.message).to.be.undefined();
    });

  });

});