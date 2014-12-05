var _ = require('lodash');

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderCtrl($state, MdConfig, $auth) {
  this.$auth = $auth;
  this.siteName = MdConfig.siteName;
}

function SectionsCtrl(MdSections, $state) {
  this.sectionGroups = MdSections.getSectionGroups($state);

  this.subsections = [1,2,3];
}

angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('SectionsCtrl', SectionsCtrl);