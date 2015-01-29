'use strict';

var _ = require('lodash');

function ManageController(resourceTypes) {
    this.flag = 9;
    this.resourceTypes = resourceTypes;
}

function ListController(resourceType, items) {
    var _this = this;

    this.resourceType = resourceType;
    this.items = items;

    this.deleteResource = function (resourceId) {
        var resource = _(items).find({id: resourceId});
        resource.remove()
        .then(function () {
            _(_this.items).remove({id: resourceId});
        });
    };
}

function ResourceTypeCreateController($state, baseResourceType, resourceType) {
    var ctrl = this;
    this.item = {};
    this.resourceType = resourceType;
    this.schemaId = 'schema1';
    this.formId = 'form1';
    this.onSubmit = function (isInvalid, model) {
        if (!isInvalid) {
            baseResourceType.post(model)
            .then(
                function () {
                    // TODO mockapia collectionCreate should change to return a
                    // HTTP 201 with a Location header for location of new item.
                    // When it does, change this to get location from headers.
                    $state.go('resource',
                    {resourceType: ctrl.resourceType, id: model.id});
                }
            );
        }
    };
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
    ResourceTypeCreateController: ResourceTypeCreateController,
    ResourceReadController: ResourceReadController,
    ResourceEditController: ResourceEditController
};
