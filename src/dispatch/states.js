'use strict';

function ModuleConfig($stateProvider) {

  $stateProvider
    .state('notfound', {
             parent: 'root',
             views: {
               'md-content@root': {
                 templateUrl: '/dispatch/templates/notfound.html',
                 controller: 'NotFoundCtrl as ctrl'

               }
             },
             params: {unfoundStateTo: ''}
           })
    .state('error', {
             parent: 'root',
             views: {
               'md-content@root': {
                 templateUrl: '/dispatch/templates/error.html',
                 controller: 'ErrorCtrl as ctrl'
               }
             },
             params: {
               toState: '',
               error: ''
             }
           })
    .state('dispatch', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: '',
                 controller: 'DispatcherCtrl as DispatcherCtrl',
                 resolve: {
                   resolvedPath: function (Dispatcher, $location, $notice) {
                     return {};
                     var path = $location.path();
                     console.debug('resolving path', path);
                     return Dispatcher.resolvePath(path)
                       .catch(function (response) {
                                var msg = 'Dispatcher error: ' + response.data.message;
                                $notice.show(msg);
                              });
                   }
                 }
               }
             }
           });
}

angular.module('md.dispatch')
  .config(ModuleConfig);