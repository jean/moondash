'use strict';

function MdConfig() {
    var _this = this;

    this.site = {name: 'Moondash'};

}

var angular = require('angular');
angular.module("moondash")
.service('MdConfig', MdConfig);
