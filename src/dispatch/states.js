'use strict';

var url = require('url');

function ModuleConfig($stateProvider) {

  $stateProvider
    .state('notfound', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: require('./templates/notfound.html'),
                 controller: 'NotFoundCtrl as ctrl'

               }
             },
             params: {unfoundStateTo: ''}
           })
    .state('error', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: require('./templates/error.html'),
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
                   resolvedPath: function ($location, $http) {
                     var path = $location.path();
                     return $http.get(path)
                       .then(
                       function (success) {
                         return success.data;
                       });
                   }

                 }
               }
             }
           });
}

angular.module('md.dispatch')
  .config(ModuleConfig);