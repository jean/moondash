function MdLayoutService($rootScope, MdConfig) {
  var _this, siteName;
  _this = this;
  siteName = MdConfig.siteName;
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

function MdSectionsService() {
  this.addSection = function (groupId, section) {
    // Allow sitedev app to extend the root section group
  };

  this.getSectionGroups = function ($state) {
    var sectionGroups = {},
      sections = {};

    // First get all the section groups
    var allStates = $state.get();
    _(allStates)
      .filter('sectionGroup')
      .forEach(
      function (state) {
        var sg = _(state.sectionGroup)
          .pick(['label', 'priority']).value();
        // If no label, try a title on the state
        if (!sg.label) sg.label = state.title;
        sg.state = state.name;
        sectionGroups[sg.state] = sg;
      });

    // Now get the sections
    _(allStates).filter('section')
      .forEach(
      function (state) {
        var section = state.section;
        var s = _(section).pick(['group', 'label', 'priority'])
          .value();
        // If no label, try a title on the state
        if (!s.label) s.label = state.title;
        s.state = state.name;
        sections[s.state] = s;
      });

    // And any subsections
    _(allStates).filter('subsection')
      .forEach(
      function (state) {
        var subsection = state.subsection;
        var section = sections[subsection.section];

        // If this section doesn't yet have an subsections, make one
        if (!section.subsections) {
          section.subsections = [];
        }

        // Add this subsection
        var ss = _(subsection).pick(['priority', 'label'])
          .value();
        // If no label, try a title on the state
        if (!ss.label) ss.label = state.title;
        ss.state = state.name;
        section.subsections.push(ss);
      });

    // Now re-assemble with sorting
    return _(sectionGroups)
      .map(
      function (sg) {
        // Get all the sections for this section group
        sg.sections = _(sections)
          .filter({group: sg.state})
          .map(
          function (s) {
            if (s.subsections) {
              var newSubsections = _(s.subsections)
                .sortBy('priority')
                .value();
              s.subsections = newSubsections;
            }
            return s;
          })
          .sortBy('priority')
          .value();
        return sg;
      })
      .sortBy('priority')
      .value();
  }
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .service('MdSections', MdSectionsService)
  .run(ModuleRun);
