function Form() {
  return {
    restrict: 'E',
    template: require('./templates/form.html'),
    scope: {
      mdModel: '=mdModel',
      mdSchema: '@mdSchema',
      mdForm: '@mdForm'
    },
    controller: 'FormCtrl',
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module('md.forms')
  .directive('mdForm', Form);
