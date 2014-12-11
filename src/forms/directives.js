function FormCtrl() {
  this.schema = {
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

  this.form = [
    "*",
    {
      type: "submit",
      title: "Save"
    }
  ];

}


function Form() {
  return {
    restrict: "E",
    templateUrl: "/forms/templates/form.html",
    scope: {
      model: '='
    },
    //scope: {
    //  ngModel: '=ngModel'
    //},
    controller: FormCtrl,
    controllerAs: 'ctrl',
    bindToController: true // Note: causes testing problems
  }
}

angular.module("moondash.forms")
  .directive("mdForm", Form);