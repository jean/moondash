function PeopleCtrl(resource) {
  this.items = resource.items;
}

angular.module('full', ['moondash'])
  .controller('PeopleCtrl', PeopleCtrl);