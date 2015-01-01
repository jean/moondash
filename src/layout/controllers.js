'use strict';

function LayoutController($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderController(MdConfig, $auth) {
  this.$auth = $auth;
  this.siteName = MdConfig.site.name;
}

function FooterController(MdConfig) {
  this.siteName = MdConfig.site.name;
}

function NavController() {
}

module.exports = {
  LayoutController: LayoutController,
  HeaderController: HeaderController,
  FooterController: FooterController,
  NavController: NavController
};