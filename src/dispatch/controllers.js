'use strict';

function DispatcherCtrl($state, resolvedPath, MdDispatcher) {

  /*

   resolvedPath will return a dictionary such as:

   {
   error: 'Some Error Condition'
   schema: 'Some Schema Identifier'
   data: {
   viewName: the name of the view,
   context: the context object,
   parents: the parents array,
   view: the dict returned by any custom view
   items: sequence of children if it is a folder
   ordering: if ordered folder, the ordering of the item ids
   }

   }

   */

  // First hande the case where resolvedPath says it couldn't
  // find anything.

  if (resolvedPath.error) {
    // This should be a not found
    $state.go('notfound');
    return;
  }

  var data = resolvedPath.data;
  MdDispatcher.context = data.context;
  MdDispatcher.viewName = data.viewName;
  MdDispatcher.parents = data.parents;

  // Get the next state. Look in all the registered states at
  // view_config information.
  var nextState = MdDispatcher.resolveState(
    MdDispatcher.context, MdDispatcher.viewName, MdDispatcher.parents);

  if (nextState) {
    $state.go(nextState);
  } else {
    // MdDispatcher failed to find a matching view
    $state.go('notfound');
  }

}

function NotFoundCtrl($location) {
  this.path = $location.path();
}

function ErrorCtrl($stateParams) {
  this.toState = $stateParams.toState;
  this.error = $stateParams.error;
}


module.exports = {
  NotFoundCtrl: NotFoundCtrl,
  ErrorCtrl: ErrorCtrl,
  DispatcherCtrl: DispatcherCtrl
};