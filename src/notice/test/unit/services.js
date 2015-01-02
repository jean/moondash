'use strict';

var
  NoticeService = require('../../services').NoticeService,
  notice,
  helper = require('../../../common/test-helper'),
  expect = helper.expect,
  spy = helper.spy,
  stub = helper.stub;


describe('Notice Service Setup', function () {

  var $modal;

  beforeEach(function () {
    $modal = {
      open: stub()
    }
  });

  it('should have basic API', function () {
    notice = new NoticeService($modal);
    expect(notice.show).to.be.a('function');
  });

});
