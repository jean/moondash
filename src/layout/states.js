function ModuleInit($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             templateUrl: '/layout/md-layout.partial.html',
               controller: "LayoutCtrl"
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 templateUrl: '/layout/md-header.partial.html',
                 controller: 'HeaderCtrl as ctrl'
               },
               'md-sectionsmenu': {
                 templateUrl: '/layout/md-sectionsmenu.partial.html'
               },
               'md-content': {
                   template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 templateUrl: '/layout/md-footer.partial.html'
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleInit);