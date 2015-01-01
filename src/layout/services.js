'use strict';

function LayoutService($rootScope, MdConfig) {
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

  // TODO Expose so unit tests can reach it. Try to change
  // changeTitle below to use this.changeTitle and write a
  // midway test for $on
  this.changeTitle = changeTitle;

  $rootScope.$on('$stateChangeSuccess', changeTitle);
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

module.exports = {
 LayoutService: LayoutService,
 Run: ModuleRun
};
