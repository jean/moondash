function MdLayoutService($rootScope, MdConfig) {
  var _this, siteName;
  _this = this;
  siteName = MdConfig.site.name;
  this.pageTitle = siteName;

  // Whenever the state changes, update the pageTitle
  function changeTitle(evt, toState) {
    if (toState.title) {
      // Sure would like to automatically put in resource.title but
      // unfortunately ui-router doesn't give me access to the resolve
      // from this event.
      _this.pageTitle = siteName + ' - ' + toState.title;
    } else {
      // Reset to default
      _this.pageTitle = siteName;
    }
  }

  $rootScope.$on('$stateChangeSuccess', changeTitle);
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .run(ModuleRun);
