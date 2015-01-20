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
  if (id == null) id = '';
  if (suffix == null) suffix = '';
  var p = path.join(prefix, id, suffix);
  p = p.replace(/\//g, '\\/');
  return new RegExp(p);
}

function MockResourceTypes(prefix, items) {
  // Allow CRUD of resource types themselves, plus bulk load
  // a bunch of mocks for existing resource types

  this.prefix = path.join('/', prefix); // e.g. /api/resourcetypes
  this.items = items ? items : {};

  this.mocks = [];

  // Go through any passed in resourcetypes, make a MockResourceType,
  // and dump the mocks
  _(this.items).forEach(function (v, k) {
    var mockType = new MockResourceType(prefix, k, v);
    var mocks = mockType.listMocks();
    this.mocks = this.mocks.concat(mockType.listMocks());
  }, this);

  this.collectionList = function (request) {
    // Return the resourcetypes in this collection as a mapping

    // Flatten this list

    var response = _(this.items).map(function (v,k) {
      return {id: k}
    });
    return response.value();
  };

  this.collectionRead = function (request) {
    // Only provide the properties of this collection, not items

    var clone = _(this).clone();
    delete clone.items;

    return clone;
  };

  this.collectionAdd = function (request) {
    // POST /api/resourcetypes as Add operation

    var newItem = request.json_body;

    this.items[newItem.id] = newItem;

    // TODO This should be an HTTP 201 response with a Location header
    // but let's take a shortcut for now.
    var location = path.join(this.prefix, newItem.id);
    return {'location': location};
  };


  this.listMocks = function () {
    // Dump the list of mocks
    var mocks = _(this.mocks).clone(),
      prefix = this.prefix;

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, '/items?'),
                 responder: this.collectionList
               });

    mocks.push({
                 mockInstance: this,
                 method: 'POST',
                 pattern: makePatternRegExp(prefix + '?'),
                 responder: this.collectionAdd
               });

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix + '?'),
                 responder: this.collectionRead
               });

    return mocks;
  }

}


function MockResourceType(prefix, id, items) {
  // A prototype/class that can generate the mocks for all the
  // actions on a type, with default methods that can be overriden as
  // well as custom actions with methods to extend the REST API.

  this.prefix = path.join('/', prefix); // e.g. /api/resourcetypes
  this.id = id;                         // e.g. invoices (plural)
  this.items = items ? items : {};

  this.getId = function (pathname) {
    // Helper function to analyze /prefix/resourcetype/id/maybeMore
    // and return just the id part

    var basePos = path.join(this.prefix, this.id).split('/').length;
    return pathname.trim().split('/')[basePos];

  };

  this.getDocument = function (pathname) {
    // Given a pathname from the request, find and return the
    // correct document. Throw a HTTPNotFound if no match

    var resourceId = this.getId(pathname);

    var document = this.items[resourceId];
    if (document == null) {
      var msg = 'No document at: ' + pathname;
      throw new exceptions.HTTPNotFound(msg)
    }

    return document;
  };

  this.collectionList = function (request) {
    // Return the items in this collection as a mapping
    // TODO implement pagination, filtering, etc.

    // Flatten this list
    return _(this.items).values().value();
  };

  this.collectionRead = function (request) {
    // Only provide the properties of this collection, not items

    // Let's do some assertions and throw errors to make writing
    // mocks more reliable and thus productive

    var clone = _(this).clone();
    delete clone.items;

    return clone;
  };

  this.collectionUpdate = function (request) {
    // Handle a PATCH

    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           this);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.collectionAdd = function (request) {
    // POST /api/resourcetypes/invoices as Add operation

    var newItem = request.json_body;

    this.items[newItem.id] = newItem;

    // TODO This should be an HTTP 201 response with a Location header
    // but let's take a shortcut for now.
    var location = path.join(this.prefix, this.id, newItem.id);
    return {'location': location};
  };

  this.collectionReplace = function (request) {
    // PUT /api/resourcetypes/invoices as Replace operation on collection

    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           this);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.documentRead = function (request) {
    // Handle a GET to a leaf

    return this.getDocument(request.pathname);
  };

  this.documentDelete = function (request) {
    // Handle a DELETE to a leaf

    var resourceId = this.getId(request.pathname);
    delete this.items[resourceId];

    return null;
  };


  this.documentUpdate = function (request) {
    // Handle a PATCH to a leaf

    var document = this.getDocument(request.pathname);
    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           document);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.documentReplace = function (request) {
    // Handle a PUT to a leaf

    var document = this.getDocument(request.pathname);
    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           document);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
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
                 responder: this.collectionList
               });

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id + '/\\w+'),
                 responder: this.documentRead
               });

    mocks.push({
                 mockInstance: this,
                 method: 'POST',
                 pattern: makePatternRegExp(prefix, id),
                 responder: this.collectionAdd
               });

    mocks.push({
                 mockInstance: this,
                 method: 'PUT',
                 pattern: makePatternRegExp(prefix, id + '?'),
                 responder: this.collectionReplace
               });

    mocks.push({
                 mockInstance: this,
                 method: 'PUT',
                 pattern: makePatternRegExp(prefix, id + '/\\w+/\\w+'),
                 responder: this.documentReplace
               });

    mocks.push({
                 mockInstance: this,
                 method: 'PATCH',
                 pattern: makePatternRegExp(prefix, id + '/\\w+/\\w+'),
                 responder: this.documentUpdate
               });

    mocks.push({
                 mockInstance: this,
                 method: 'PATCH',
                 pattern: makePatternRegExp(prefix, id + '?'),
                 responder: this.collectionUpdate
               });

    mocks.push({
                 mockInstance: this,
                 method: 'DELETE',
                 pattern: makePatternRegExp(prefix, id + '/*'),
                 responder: this.documentDelete
               });

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id),
                 responder: this.collectionRead
               });


    return mocks;
  };

}

module.exports = {
  makePatternRegExp: makePatternRegExp,
  MockResourceTypes: MockResourceTypes,
  MockResourceType: MockResourceType
};