function MdLayoutService($rootScope, MdConfig) {
  var _this = this;
  this.pageTitle = MdConfig.siteName;

  // Whenever the state changes, update the pageTitle
  function changeTitle(evt, toState) {
    if (toState.title) {
      // Sure would like to automatically put in resource.title but
      // unfortunately ui-router doesn't give me access to the resolve
      // from this event.
      _this.pageTitle = MdConfig.siteName + ' - ' + toState.title;
    } else {
      // Reset to default
      _this.pageTitle = MdConfig.siteName;
    }
  }

  $rootScope.$on('$stateChangeSuccess', changeTitle);
}

function MdSectionsService($state) {
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
  .service('MdSections', MdSectionsService)
  .run(function ($rootScope, MdLayout, $state) {
         $rootScope.layout = MdLayout;
       });
