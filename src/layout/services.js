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

function MdSectionsService($injector) {
  this.sectionGroups = [];

  this.addSectionGroup = function (sg) {
    this.sectionGroups.push(sg);
  };

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
        var sg = state.sectionGroup;
        sectionGroups[sg.id] = _(sg)
          .pick(['id', 'label', 'priority']).value();
      });

    // Now get the sections
    _(allStates).filter('section')
      .forEach(
      function (state) {
        var section = state.section;
        var s = _(section).pick(['group', 'id', 'label', 'priority'])
          .value();
        s.name = state.name;
        sections[s.id] = s;
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
        // Blow away the section's state, as it is just a holder for
        // subsections.
        delete section.state;

        // Add this subsection
        var ss = _(subsection).pick(['priority', 'id', 'label'])
          .value();
        ss.name = state.name;
        section.subsections.push(ss);
      });

    // Now re-assemble with sorting
    return _(sectionGroups)
      .map(
      function (sg) {
        // Get all the sections for this section group
        sg.sections = _(sections)
          .filter({group: sg.id})
          .map(
          function (s) {
            var newSubsections = _(s.subsections)
              .sortBy('priority')
              .value();
            s.subsections = newSubsections;
            return s;
          })
          .sortBy('priority')
          .value();
        return sg;
      })
      .sortBy('priority')
      .value();



    // Called by the sections control
    //var sections = _($state.get())
    //  .filter(function (state) {
    //            return _.has(state, "section");
    //          })
    //  .map(function (state) {
    //         var s = state.section;
    //         return {
    //           title: s.title,
    //           state: state.name
    //         };
    //       })
    //  //.sortBy("priority")
    //  .value();

  }
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

angular.module('moondash')
  .service('MdLayout', MdLayoutService)
  .service('MdSections', MdSectionsService)
  .run(ModuleRun);
