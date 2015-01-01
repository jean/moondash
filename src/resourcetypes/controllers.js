'use strict';

function ManageCtrl() {
}

function ListCtrl($stateParams, items) {
  this.rtype = $stateParams.rtype;
  this.items = items;
}

function EditCtrl(item) {
  this.item = item;
  this.schemaId = 'schema1';
  this.formId = 'form1';
}

angular.module('md.resourcetypes')
  .controller('ManageCtrl', ManageCtrl)
  .controller('EditCtrl', EditCtrl)
  .controller('ListCtrl', ListCtrl);
