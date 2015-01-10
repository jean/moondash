/*

 Standard HTTP exceptions that can be thrown in mock implementations
 and have the correct status code returned.

 */

// Custom exceptions that can be used by mocks, stored later on
// the service
function HTTPNotFound(message) {
  this.name = 'HTTPNotFound';
  this.statusCode = 404;
  this.message = message || 'Not Found';
}
function HTTPUnauthorized(message) {
  this.name = 'HTTPUnauthorized';
  this.statusCode = 401;
  this.message = message || 'Login Required';
}
function HTTPNoContent() {
  this.name = 'HTTPNoContent';
  this.statusCode = 204;
}

module.exports = {
  HTTPNotFound: HTTPNotFound,
  HTTPUnauthorized: HTTPUnauthorized,
  HTTPNoContent: HTTPNoContent
};