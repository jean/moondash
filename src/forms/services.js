'use strict';

function SchemasService() {
  var _this = this;
  this.schemas = {};

  this.get = function (schemaId) {
    return this.schemas[schemaId];
  };

  this.init = function (schemas) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "schemas" part of the JSON.

    _(schemas).forEach(
      function (schema, id) {
        _this.schemas[id] = schema;
      }
    );

  }

}

function FormsService() {
  var _this = this;
  this.forms = {};

  this.get = function (formId) {
    return _this.forms[formId];
  };

  this.init = function (forms) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "forms" part of the JSON.

    _(forms).forEach(
      function (form, id) {
        _this.forms[id] = form;
      }
    );

  }
}

module.exports = {
  SchemasService: SchemasService,
  FormsService: FormsService
};
