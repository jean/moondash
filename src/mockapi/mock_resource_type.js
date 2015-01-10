/*

 Base class to quickly build up a mock REST API for a resource type:

 - Collections and documents
 - Standard operations with default (but overridable) implementations
 - Extensible, custom operations

 */

'use strict';

var
  _ = require('lodash'),
  path = require('path'),
  exceptions = require('./exceptions');

function makePatternRegExp(prefix, id, suffix) {
  if (suffix == null) suffix = '';
  var p = path.join(prefix, id, suffix);
  p = p.replace(/\//g, '\\/');
  return new RegExp(p);
}


function MockResourceType(prefix, id, items) {
  // A prototype/class that can generate the mocks for all the
  // actions on a type, with default methods that can be overriden as
  // well as custom actions with methods to extend the REST API.

  this.prefix = path.join('/', prefix); // e.g. /api/resourcetypes
  this.id = id;                         // e.g. invoices (plural)
  this.items = items ? items : {};

  this.getDocument = function (pathname) {
    // Given a pathname from the request, find and return the
    // correct document. Throw a HTTPNotFound if no match

    // Where in the pathname, relative to the
    // /api/resourcetypes/invoice, is the id?
    var basePos = path.join(this.prefix, this.id).split('/').length;
    var resourceId = pathname.trim().split('/')[basePos];

    var document = this.items[resourceId];
    if (document == null) {
      var msg = 'No document at: ' + pathname;
      throw new exceptions.HTTPNotFound(msg)
    }

    return document;
  };

  this.collectionLIST = function (request) {
    // Return the items in this collection as a mapping
    // TODO implement pagination, filtering, etc.

    // Flatten this list
    return _(this.items).values().value();
  };

  this.collectionREAD = function (request) {
    // Only provide the properties of this collection, not items

    // Let's do some assertions and throw errors to make writing
    // mocks more reliable and thus productive

    var clone = _(this).clone();
    delete clone.items;

    return clone;
  };

  this.collectionUPDATE = function (request) {
    // Handle a PATCH

  };

  this.collectionREPLACE = function () {
    // Handle a PUT

  };

  this.documentREAD = function (request) {
    // Handle a GET to a leaf

    return this.getDocument(request.pathname);
  };

  this.listMocks = function () {
    // Get a list of MdMockRest-compatible registrations

    var
      mocks = [],
      prefix = this.prefix,
      id = this.id;

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id, '/items'),
                 responder: this.collectionLIST
               });

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id + '/*'),
                 responder: this.documentREAD
               });
    return mocks;
  };

}

module.exports = {
  makePatternRegExp: makePatternRegExp,
  MockResourceType: MockResourceType
};