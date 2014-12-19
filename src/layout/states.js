function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/templates/md-layout.html',
             controller: "LayoutCtrl"
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 templateUrl: '/layout/templates/md-header.html',
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-nav': {
                 templateUrl: '/layout/templates/md-nav.html',
                 controller: 'NavCtrl as ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 templateUrl: '/layout/templates/md-footer.html',
                 controller: 'FooterCtrl as ctrl'
               }
             }
           });
}


angular.module('moondash')
  .config(ModuleConfig);