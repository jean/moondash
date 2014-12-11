function FormCtrl($scope) {
  $scope.schema = {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        title: "Name",
        description: "Name or alias"
      },
      title: {
        type: "string",
        enum: ['dr', 'jr', 'sir', 'mrs', 'mr', 'NaN', 'dj']
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


function Form() {
  return {
    restrict: "E",
    templateUrl: "/forms/templates/form.html",
    //require: '^ngModel',
    //scope: {
    //  ngModel: '=ngModel'
    //},
    controller: FormCtrl,
    controllerAs: 'ctrl'
  }
}

angular.module("moondash.forms")
  .directive("mdForm", Form);