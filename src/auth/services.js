function Profile(Restangular) {
  return {
    getProfile: function () {
      return Restangular.one('/api/auth/me').get();
    }
  };
}

angular.module("moondash")
  .factory('MdProfile', Profile);
