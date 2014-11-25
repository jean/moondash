'use strict';

function ModuleInit($stateProvider) {
  console.debug('in layout');
  $stateProvider
    .state("site", {
             url: '/',
             abstract: true,
             templateUrl: '/layout/mn-layout.partial.html'
           })
}

angular.module('moondash')
  .config(ModuleInit);