'use strict';

function ModuleInit($stateProvider) {
  $stateProvider
    .state("site", {
             url: '/',
             abstract: true,
             templateUrl: '/layout/mn-layout.partial.html'
           })
}

angular.module('moondash')
  .config(ModuleInit);