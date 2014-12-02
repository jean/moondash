function MdLayoutService () {

}
function MdSectionsService ($state) {
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
          label: "Users", state: "root.types.users"
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
