function MdLayoutService() {

}
function MdSectionsService() {
  this.sections = [
    {
      label: false,
      items: [
        {
          label: "Dashboard", state: "root.dashboard"
        },
        {
          label: "Settings", state: "root.settings"
        }
      ]
    },
    {
      label: "Types",
      items: [
        {
          label: "People", state: "root.types.people"
        },
        {
          label: "Invoices", state: "root.types.invoices"
        }
      ]
    }
  ]
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .service('MdSections', MdSectionsService);
