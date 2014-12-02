var _ = require('lodash');

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function SectionsCtrl(MdSections) {
  this.sectionGroups = MdSections.sectionGroups;
}

function HeaderCtrl($state, MdConfig) {
  this.siteName = MdConfig.siteName;
  this.sections = _($state.get())
    .filter(function (state) {
              return _.has(state, "section");
            })
    .map(function (state) {
           var s = state.section;
           return {
             title: s.title,
             state: state.name
           };
         })
    //.sortBy("priority")
    .value();
}
angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);