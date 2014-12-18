var _ = require('lodash');

function LayoutCtrl($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderCtrl(MdConfig, $auth) {
  this.$auth = $auth;
  this.siteName = MdConfig.site.name;
}

function FooterCtrl(MdConfig) {
  this.siteName = MdConfig.site.name;
}

function NavCtrl(MdConfig, MdSections, $state) {
  this.navMenus = MdConfig.navMenus;
  this.sectionGroups = MdSections.getSectionGroups($state);
}

angular.module('moondash')
  .controller('LayoutCtrl', LayoutCtrl)
  .controller('HeaderCtrl', HeaderCtrl)
  .controller('FooterCtrl', FooterCtrl)
  .controller('NavCtrl', NavCtrl);