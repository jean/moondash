function FormCtrl(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}


function Form() {
  var directive = {
    restrict: "E",
    templateUrl: "/forms/templates/form.html",
    scope: {
      mdModel: '=mdModel',
      mdSchema: '=mdSchema',
      mdForm: '=mdForm'
    },
    controller: FormCtrl,
    controllerAs: 'ctrl',
    bindToController: true // Note: causes testing problems
  };
  return directive;
}

angular.module("moondash.forms")
  .directive("mdForm", Form);