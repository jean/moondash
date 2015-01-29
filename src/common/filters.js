'use strict';

var _ = require('lodash');

function OrderObjectByFilter() {
    return function (items, field, reverse) {
        var filtered = [];
        _(items).forEach(function (item) {
            filtered.push(item);
        });
        function index(obj, i) {
            return obj[i];
        }

        filtered.sort(function (a, b) {
            var comparator;
            var reducedA = field.split('.').reduce(index, a);
            var reducedB = field.split('.').reduce(index, b);
            if (reducedA === reducedB) {
                comparator = 0;
            } else {
                comparator = (reducedA > reducedB ? 1 : -1);
            }
            return comparator;
        });
        if (reverse) {
            filtered.reverse();
        }
        return filtered;
    };
}

module.exports = {
    OrderObjectByFilter: OrderObjectByFilter
};
