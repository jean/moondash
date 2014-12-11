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

  this.model = {};

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