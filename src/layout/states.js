function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             template: require('./templates/md-layout.html'),
             controller: "LayoutController"
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 template: require('./templates/md-header.html'),
                 controller: 'HeaderController as ctrl'
               },
               'md-nav': {
                 template: require('./templates/md-nav.html'),
                 controller: 'NavController as ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 template: require('./templates/md-footer.html'),
                 controller: 'FooterController as ctrl'
               }
             }
           });
}


angular.module('moondash')
  .config(ModuleConfig);