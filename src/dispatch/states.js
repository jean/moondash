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
                   resolvedPath: function (Restangular, $location) {
                     var path = 'api' + $location.path();
                     return Restangular.one(path).get();
                   }

                 }
               }
             }
           });
}

angular.module('md.dispatch')
  .config(ModuleConfig);