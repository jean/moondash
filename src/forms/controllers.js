'use strict';

function FormController(MdSchemas, MdForms) {
  var ctrl = this;
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
  this.submit = function (form) {
    ctrl.mdSubmit()(form.$invalid, ctrl.model);
  };
}

module.exports = {
  FormController: FormController
};