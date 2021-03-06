var _ = require('lodash');

function Dispatcher() {
  var _this = this;

  // At startup, take the list of states and make a viewMap. The
  // viewMap will look like:
  // default:
  //   [
  //      {resourceType: 'Folder', containment: something,
  //       stateName: 'folder-default'
  //      }
  //   ]
  // Meaning, it has the predicate information used in Pyramid
  // views. We key on viewName just to speed up the resolution.
  this.viewMap = {};
  this.resetViewMap = function () {
    // Reset viewMap
    _this.viewMap = {};
  };
  this.addStateToViewMap = function (state) {
    // Add a new state to viewMap (without best-match ordering)
    var vc = state.viewConfig;
    var viewName;
    var tmpElem;
    if (vc) {
      // This state has a viewConfig
      viewName = vc.name;
      tmpElem = {
        name: viewName,
        resourceType: vc.resourceType,
        stateName: state.name,
        containment: vc.containment,
        pathInfo: vc.pathInfo,
        marker: vc.marker
      };

      // If the viewMap doesn't yet have this
      // viewName, add it with an empty seq
      if (!_this.viewMap[viewName]) {
        _this.viewMap[viewName] = [tmpElem];
      }
      else {
        _this.viewMap[viewName].push(tmpElem);
      }
    }
  };
  this.updateTraversal = function () {
    // Update _this.disableDispatch property if _this.viewMap is empty
    _this.disableDispatch = _.isEmpty(_this.viewMap);
  };
  this.orderViewMap = function () {
    // Post processing of viewMap with best match order
    _(_this.viewMap)
      .forEach(function (value, key) {
                 _this.viewMap[key] = _(_this.viewMap[key])
                   .chain()
                   .sortBy(function (item) {
                             return item.marker;
                           })
                   .sortBy(function (item) {
                             return item.resourceType;
                           })
                   .sortBy(function (item) {
                             return item.containment;
                           })
                   .sortBy(function (item) {
                             return item.pathInfo;
                           })
                   .sortBy(function (item) {
                             return item.marker;
                           })
                   .value();
               });
  };
  this.makeViewMap = function (states) {
    // reset view map
    _this.resetViewMap();

    // add (only viewConfig based) states to viewMap
    _(states)
      .filter(function (state) {
                return _.has(state, "viewConfig");
              })
      .forEach(_this.addStateToViewMap);

    // Post processing of viewMap with best match order
    _this.orderViewMap();

    // Update _this.disableDispatch property if _this.viewMap is empty
    _this.updateTraversal();
  };

  this.resolveState = function (context, viewName, parents) {
    // Based on request info, find the matching view in the view
    // map based on priority.
    var views, parentTypes, matchingView, i, view, parentMarkers, viewConfigMarker;

    // Get the view matching this resolved viewName from the viewMap
    views = _this.viewMap[viewName];

    if (views) {
      // Get some of the data needed by the predicates
      parentsChain = _(parents)
        .chain()
        .map(function (p) {
               return [p.resourceType, p.markers];
             })
        .zip()
        .value();
      parentTypes = _.uniq(parentsChain[0]);
      parentMarkers = _.uniq(_.flatten(parentsChain[1]));
      markers = context.markers;
      pathInfo = context.path;

      // Go through all the views, assigning a score
      matchingView = null;
      for (i = 0; i < views.length; i++) {
        viewConfig = views[i];
        viewConfigMarker = viewConfig.marker;

        if (viewConfig.resourceType) {
          if (viewConfig.resourceType !== context.resourceType) {
            continue;
          }
        }
        if (viewConfig.containment) {
          if (!_.contains(parentTypes, viewConfig.containment)) {
            continue;
          }
        }
        if (viewConfig.marker) {
          if (!_.contains(markers, viewConfigMarker)) {
            if (!_.contains(parentMarkers, viewConfigMarker)) {
              continue;
            }
          }
        }
        if (viewConfig.pathInfo) {
          if (!_.contains(pathInfo, viewConfig.pathInfo)) {
            continue;
          }
        }

        return viewConfig.stateName;

      }
    }
    else {
      return undefined;
    }
  };
}

module.exports = {
  Dispatcher: Dispatcher
};
