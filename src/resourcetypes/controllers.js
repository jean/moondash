'use strict';

function ManageController() {
  this.flag = 9;
}

function ListController($stateParams, items) {
  this.rtype = $stateParams.rtype;
  this.items = items;
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
