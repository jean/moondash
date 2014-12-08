function NestedSectionCtrl($scope){
  this.isCollapsed = true;
  this.section = $scope.ngModel;
}


function NestedSection() {
  return {
    restrict: "E",
    templateUrl: "/layout/templates/nested-section.html",
    require: '^ngModel',
    scope: {
      ngModel: '=ngModel'
    },
    controller: NestedSectionCtrl,
    controllerAs: 'ctrl'
  }
}

angular.module("moondash")
  .directive("mdNestedSection", NestedSection);