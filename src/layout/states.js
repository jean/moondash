function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             template: require('./templates/md-layout.html'),
             controller: "LayoutCtrl"
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 template: require('./templates/md-header.html'),
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-nav': {
                 template: require('./templates/md-nav.html'),
                 controller: 'NavCtrl as ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 template: require('./templates/md-footer.html'),
                 controller: 'FooterCtrl as ctrl'
               }
             }
           });
}


angular.module('moondash')
  .config(ModuleConfig);