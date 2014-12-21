function ManageCtrl() {
}

function ListCtrl($stateParams, items) {
  this.rtype = $stateParams.rtype;
  this.items = items;
}


angular.module('md.resourcetypes')
  .controller('ManageCtrl', ManageCtrl)
  .controller('ListCtrl', ListCtrl);
