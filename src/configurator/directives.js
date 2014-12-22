function InitCtrl(Restangular, MdConfig, MdNav, MdRTypes) {
    Restangular.one('full/siteconfig.json').get()
      .then(
      function (siteconfig) {

        // Set the site name
        MdConfig.site.name = siteconfig.site.name;

        // Add resource types and nav menus
        MdRTypes.init(siteconfig.rtypes);
        MdNav.init(siteconfig.navMenus);
      },
      function (failure) {
        var msg = 'Failed to get siteconfig.json';
        $notice.show(msg);
      });
}

function Init () {
  return {
    restrict: 'A',
    template: '',
    scope: {
      url: '@mdInit'
    },
    controller: InitCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module('md.config')
  .directive('mdInit', Init);
