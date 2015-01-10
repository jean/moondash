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
  if (prefix[0] == '/') {
    // Remove this
    prefix = prefix.substring(1);
  }
  var p = path.join(prefix, id, suffix);
  p = p.replace(/\//g, '\\/');
  return new RegExp(p);
}


function MockResourceType(prefix, id, items) {
  // A prototype/class that can generate the mocks for all the
  // actions on a type, with default methods that can be overriden as
  // well as custom actions with methods to extend the REST API.

  this.prefix = prefix;             // e.g. /api/resourcetypes
  this.id = id;                     // e.g. invoices (plural)
  this.items = items ? items : {};

  this.collectionLIST = function (request) {
    // Return the items in this collection as a mapping
    // TODO implement pagination, filtering, etc.

    return this.items;
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
    return 9;
  };

  this.listMocks = function () {
    // Get a list of MdMockRest-compatible registrations

    var
      mocks = [],
      basePattern = path.join(this.prefix, this.id),
      prefix = this.prefix,
      id = this.id;

    // Collection items
    mocks.push({
                 mockInstance: this,
                 pattern: makePatternRegExp(prefix, id, '/items$'),
                 responder: this.collectionLIST
               });

    // Finally, push collectionGET to match last
    mocks.push({pattern: basePattern, responder: this.collectionREAD});

    return mocks;
  };

}

//MockResourceType.prototype.collectionLIST = function (request) {
//  // Return the items in this collection as a mapping
//  // TODO implement pagination, filtering, etc.
//
//  return this.items;
//};


module.exports = {
  makePatternRegExp: makePatternRegExp,
  MockResourceType: MockResourceType
};