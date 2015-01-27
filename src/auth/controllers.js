function LoginCtrl($auth, $notice) {
    var _this = this;
    this.errorMessage = false;

    this.login = function ($valid, username, password) {
        $auth.login({username: username, password: password})
        .then(function () {
            _this.errorMessage = false;
            $notice.show('You have successfully logged in');
        })
        .catch(function (response) {
            _this.errorMessage = response.data.message;
        });
    };
}

function LogoutCtrl($auth, $notice) {
    $auth.logout()
    .then(function () {
        $notice.show('You have been logged out');
    });
}

function ProfileCtrl(profile) {
    this.profile = profile;
}

module.exports = {
    LoginCtrl: LoginCtrl,
    LogoutCtrl: LogoutCtrl,
    ProfileCtrl: ProfileCtrl
};
