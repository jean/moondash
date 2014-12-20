(function () {

  function ModuleRun(Restangular, $notice, MdConfig, MdRTypes) {
    // Get the siteconfig.json file and use it to declaratively setup
    // this site's configuration (site name, resource types, schemas,
    // forms, etc.
    Restangular.one('full/siteconfig.json').get()
      .then(
      function (config) {

        // Set the site name
        MdConfig.site.name = config.site.name;

        // Add resource types
        _(config.rtypes.items).forEach(
          function (rtype) {
            MdRTypes.add(rtype.id, rtype.label);
          }
        );
        MdRTypes.urlPrefix = config.rtypes.urlPrefix;
      },
      function (failure) {
        var msg = 'Failed to get siteconfig.json';
        $notice.show(msg);
      });
  }

  angular.module('full', ['moondash'])
    .run(ModuleRun);

})();
