'use strict';

function FormController(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}

module.exports = {
  FormController: FormController
};