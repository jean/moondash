'use strict';

require('./controllers')

function ModuleInit($stateProvider) {
  $stateProvider
    .state("site", {
             url: '/',
             abstract: true,
             templateUrl: '/layout/mn-layout.partial.html',
             controller: 'LayoutCtrl as ctrl'
           })
}

angular.module('moondash')
  .config(ModuleInit);