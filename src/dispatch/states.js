'use strict';

function ResolvePath(MdDispatcher, $location, $state) {
  var path = $location.path();
  return MdDispatcher.resolvePath(path)
    .catch(function (response) {
             if (response.status == 404) {
               $state.go('notfound', {unfoundStateTo: path})
             }
           });
}

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
                   resolvedPath: ResolvePath
                 }
               }
             }
           });
}

angular.module('md.dispatch')
  .config(ModuleConfig);