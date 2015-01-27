'use strict';

var controllers = require('./controllers');

function NavPanel() {
    return {
        restrict: 'E',
        template: require('./templates/navpanel.html'),
        scope: {},
        controller: controllers.NavPanelController,
        controllerAs: 'ctrl',
        bindToController: true
    };
}


function NavMenu() {
    return {
        restrict: 'E',
        template: require('./templates/navmenu.html'),
        scope: {
            menuitem: '=ngModel'
        },
        controller: controllers.NavMenuController,
        controllerAs: 'ctrl',
        bindToController: true
    };
}


function NavSubmenu() {
    return {
        restrict: 'E',
        template: require('./templates/submenu.html'),
        require: '^ngModel',
        scope: {
            menuitem: '=ngModel'
        },
        controller: controllers.NavSubmenuController,
        controllerAs: 'ctrl',
        bindToController: true
    };
}

module.exports = {
    NavMenu: NavMenu,
    NavSubmenu: NavSubmenu,
    NavPanel: NavPanel
};
