(function () {

  function FeaturesCtrl(resource) {
    this.features = resource.items;
  }

  function CollapseCtrl($scope) {
    $scope.isCollapsed = true;
  }

  angular.module('full')
    .controller('FeaturesCtrl', FeaturesCtrl)
    .controller('CollapseCtrl', CollapseCtrl);

})();
