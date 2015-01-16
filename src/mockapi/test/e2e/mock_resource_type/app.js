function HelloController () {
    this.title = 'Mock Resource Type';
}

angular.module('hello', ['moondash'])
  .controller('HelloController', HelloController);