(function () {

  function FeaturesCtrl(resource) {
    this.features = resource.items;
  }

  function CollapseCtrl($scope) {
    $scope.isCollapsed = true;
  }

  function FormCtrl($scope) {
    $scope.schema = {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2, title: "Name", description: "Name or alias" },
          title: {
            type: "string",
            enum: ['dr','jr','sir','mrs','mr','NaN','dj']
          }
        }
    };

    $scope.form = [
        "*",
        {
          type: "submit",
          title: "Save"
        }
      ];

    $scope.model = {};
  }

  angular.module('full')
    .controller('FeaturesCtrl', FeaturesCtrl)
    .controller('CollapseCtrl', CollapseCtrl)
    .controller('FormCtrl', FormCtrl);

})();
