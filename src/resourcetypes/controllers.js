'use strict';

function ManageController() {
  this.flag = 9;
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

function EditController(item) {
  this.item = item;
  this.schemaId = 'schema1';
  this.formId = 'form1';
}

module.exports = {
  ManageController: ManageController,
  ListController: ListController,
  EditController: EditController
};
