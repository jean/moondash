var _ = require('lodash');

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderCtrl($state, MdConfig) {
  this.siteName = MdConfig.siteName;
}

function SectionsCtrl(MdSections, $state) {
  this.sectionGroups = MdSections.getSectionGroups($state);
  console.debug('sectionGroups332', this.sectionGroups);
}

angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);