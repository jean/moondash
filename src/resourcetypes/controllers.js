'use strict';

var _ = require('lodash');

function ManageController(resourceTypes) {
  this.flag = 9;
  this.resourceTypes = resourceTypes;
}

function ListController($stateParams, items) {
  var _this = this;
  this.resourcetype = $stateParams.resourcetype;
  this.items = items;

  this.deleteResource = function (resourceId) {
    var resource = _(items).find({id: resourceId});
    resource.remove()
      .then(function () {
              _(_this.items).remove({id: resourceId});
            });
  }
}

function ResourceReadController(resource) {
  this.resource = resource.plain();
  this.pairs = _.pairs(resource.plain());
}

function ResourceEditController(resource) {
  this.item = resource;
  this.schemaId = 'schema1';
  this.formId = 'form1';
}

module.exports = {
  ManageController: ManageController,
  ListController: ListController,
  ResourceReadController: ResourceReadController,
  ResourceEditController: ResourceEditController
};
