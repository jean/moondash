function LoginCtrl($auth, notice) {
  var _this = this;

  notice.show('starting')
  this.login = function ($valid, username, password) {
    $auth.login({username: username, password: password})
      .then(function () {
              notice.show('You have successfully logged in');
            })
      .catch(function (response) {
               notice.show(response.data.message);
             });
  }
}

function LogoutCtrl() {
}

function ProfileCtrl() {
}

angular.module('moondash')
  .controller('LoginCtrl', LoginCtrl)
  .controller('LogoutCtrl', LogoutCtrl)
  .controller('ProfileCtrl', ProfileCtrl);
