(function () {
  function FeaturesCtrl(resource) {
    this.features = resource.items;
  }

  angular.module('full')
    .controller('FeaturesCtrl', FeaturesCtrl);

})();
