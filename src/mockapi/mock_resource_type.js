/*

 Base class to quickly build up a mock REST API for a resource type:

 - Collections and documents
 - Standard operations with default (but overridable) implementations
 - Extensible, custom operations

 */

'use strict';

var
  _ = require('lodash'),
  exceptions = require('./exceptions');

function MockResourceType(prefix, id, items) {
  // A prototype/class that can generate the mocks for all the
  // actions on a type, with default methods that can be overriden as
  // well as custom actions with methods to extend the REST API.

  this.prefix = prefix;             // e.g. /api/resourcetypes
  this.id = id;                     // e.g. invoices (plural)
  this.items = items ? items : {};

  this.collectionREAD = function (request) {
    // Only provide the properties of this collection, not items

    // Let's do some assertions and throw errors to make writing
    // mocks more reliable and thus productive

    var clone = _(this).clone();
    delete clone.items;
    return clone;
  };

  this.collectionLIST = function () {
    // Return the items in this collection as a mapping
    // TODO implement pagination, filtering, etc.
    return this.items;
  };

  this.collectionUPDATE = function () {
    //

  };

  this.collectionREPLACE = function () {
    //

  };


}

module.exports = {
  MockResourceType: MockResourceType
};