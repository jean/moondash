'use strict';

var controllers = require('./controllers');

function Form() {
  return {
    restrict: 'E',
    template: require('./templates/form.html'),
    scope: {
      mdModel: '=mdModel',
      mdSchema: '@mdSchema',
      mdForm: '@mdForm',
      mdSubmit: '&mdSubmit'
    },
    controller: controllers.FormController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

module.exports = {
  FormDirective: Form
};