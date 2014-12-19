function FormCtrl(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}


function Form() {
  return {
    restrict: "E",
    templateUrl: "/forms/templates/form.html",
    scope: {
      mdModel: '=mdModel',
      mdSchema: '@mdSchema',
      mdForm: '@mdForm'
    },
    controller: FormCtrl,
    controllerAs: 'ctrl',
    bindToController: true // Note: causes testing problems
  };
}


function ResourceTypeCtrl(Restangular) {
  var self = this;
  var url = '/api/' + this.mdResource;
  Restangular.one(url).get().then(function (resource) {
    self.resource = resource;
  });
}


function ResourceType() {
  return {
    restrict: "E",
    templateUrl: "/forms/templates/resource.html",
    scope: {
      mdResource: '@mdResource'
    },
    controller: ResourceTypeCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}


angular.module("md.forms")
  .directive("mdForm", Form)
  .directive("mdResourceType", ResourceType);
