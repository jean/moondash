function ModuleConfig($stateProvider) {
  $stateProvider
    .state('auth', {
             url: '/auth',
             parent: 'root'
           })
    .state('auth.login', {
             url: '/login',
             views: {
               'md-content@root': {
                 template: require('./templates/login.html'),
                 controller: 'LoginCtrl as ctrl'
               }
             }
           })
    .state('auth.logout', {
             url: '/logout',
             views: {
               'md-content@root': {
                 controller: 'LogoutCtrl as ctrl',
                 template: require('./templates/logout.html')
               }
             }
           })
    .state('auth.profile', {
             url: '/profile',
             //authenticate: true,
             views: {
               'md-content@root': {
                 template: require('./templates/profile.html'),
                 controller: 'ProfileCtrl as ctrl'
               }
             },
             resolve: {
               profile: function (MdProfile) {
                 return MdProfile.getProfile();
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleConfig);