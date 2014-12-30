function Profile(Restangular) {
  return {
    getProfile: function () {
      return Restangular.one('/api/auth/me').get();
    }
  };
}

module.exports = {
  Profile: Profile
};
