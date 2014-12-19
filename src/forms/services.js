function MdSchemasService() {
  this.schemas = {
    schema1: {
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
    }
  };

  this.get = function (schemaId) {
    // Implement a registry later of schemas loaded in the configurator
    return this.schemas[schemaId];
  };

}

function MdFormsService() {
  this.forms = {
    form1: [
      "*",
      {
        type: "submit",
        title: "Save"
      }
    ]
  };

  this.get = function (formId) {
    // Implement a registry later of forms loaded in the configurator
    return this.forms[formId];
  };

}

angular.module('md.forms')
  .service('MdSchemas', MdSchemasService)
  .service('MdForms', MdFormsService);