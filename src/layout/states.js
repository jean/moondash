'use strict';

var controllers = require('./controllers');

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             template: require('./templates/md-layout.html'),
             controller: controllers.LayoutController,
             controllerAs: 'ctrl'
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 template: require('./templates/md-header.html'),
                 controller: controllers.HeaderController,
                 controllerAs: 'ctrl'
               },
               'md-nav': {
                 template: require('./templates/md-nav.html'),
                 controller: controllers.NavController,
                 controllerAs: 'ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 template: require('./templates/md-footer.html'),
                 controller: controllers.FooterController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};
