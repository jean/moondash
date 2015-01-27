'use strict';

var controllers = require('./controllers');

function NoticeService($modal) {
    this.show = function (message) {
        var modalInstance = $modal.open(
        {
            template: require('./templates/notice.html'),
            controller: controllers.NoticeController,
            controllerAs: 'ctrl',
            size: 'sm',
            resolve: {
                message: function () {
                    return message;
                }
            }
        });

        modalInstance.result.then(function () {

        });

    };
}

module.exports = {
    NoticeService: NoticeService
};
