var _ = require('lodash');

function HeaderCtrl($state) {
  this.sections = _($state.get())
    .filter(function (state) {
              return _.has(state, "section");
            })
    .map(function (state) {
           var s = state.section;
           return {
             title: s.title,
             state: state.name
           };
         })
    //.sortBy("priority")
    .value();
}
angular.module('moondash')
  .controller('HeaderCtrl', HeaderCtrl);