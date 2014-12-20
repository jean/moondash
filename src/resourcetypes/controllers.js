function ManageCtrl() {
}

function ListCtrl($stateParams) {
  this.rtype = $stateParams.rtype;
}


angular.module('md.resourcetypes')
  .controller('ManageCtrl', ManageCtrl)
  .controller('ListCtrl', ListCtrl);
