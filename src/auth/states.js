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
                 templateUrl: '/auth/login.partial.html',
                 controller: 'LoginCtrl as ctrl'
               }
             }
           })
    .state('auth.logout', {
             url: '/logout',
             views: {
               'md-content@root': {
                 controller: 'LogoutCtrl as ctrl',
                 templateUrl: '/auth/logout.partial.html'
               }
             }
           })
    .state('auth.profile', {
             url: '/profile',
             //authenticate: true,
             views: {
               'md-content@root': {
                 templateUrl: '/auth/profile.partial.html',
                 controller: 'ProfileCtrl as ctrl'
               }
             },
             resolve: {
               profile: function (MdProfile, $notice) {
                 return MdProfile.getProfile();
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleConfig);