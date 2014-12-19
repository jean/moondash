'use strict';

function ModuleConfig($urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector) {
    // The URL failed to resolve. Let's give a try at traversal.
    var
      $state = $injector.get('$state'),
      MdDispatcher = $injector.get('MdDispatcher');


    // XXX Can't do this on every request
    // Grab all the registered view_config info from the states. Make
    // a dict with a key of the view name, value all the view_config
    // info.
    MdDispatcher.makeViewMap($state.get());


    // If there are viewConfig settings on any states, use traversal
    // unless configuration wants it disabled.
    if (!MdDispatcher.disableTraversal) {
      $state.go('dispatch');
    } else {
      $state.go('notfound', {unfoundStateTo: 'dispatch'});
    }
  });
}

function ModuleRun($rootScope, $state, MdDispatcher) {
    // Put the MdDispatcher on the root scope so that it is available in
    // all templates.
    $rootScope.dispatcher = MdDispatcher;

    // Not Found. Tried to go to a state that doesn't exist.
    $rootScope
      .$on(
      '$stateNotFound',
      function (event, unfoundState, fromState, fromParams) {
        event.preventDefault();
        $state.go('notfound', {unfoundStateTo: unfoundState.to});
      });

    // Error handler. Display errors that occur in state resolves etc.
    $rootScope
      .$on(
      '$stateChangeError',
      function (event, toState, toParams, fromState, fromParams, error) {
        event.preventDefault();
        $state.go('error', {toState: toState.name, error: error});
      });
}


angular.module('md.dispatch')
  .config(ModuleConfig)
  .run(ModuleRun);