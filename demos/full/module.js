(function () {

  function ModuleRun(Restangular, $notice, MdConfig, MdRTypes, MdNav) {
    // Get the sitesiteconfig.json file and use it to declaratively setup
    // this site's siteconfiguration (site name, resource types, schemas,
    // forms, etc.
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

  angular.module('full', ['moondash'])
    .run(ModuleRun);

})();
