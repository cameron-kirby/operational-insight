var logger = require('./Logger');

/**
 * Creates a logs an error message.
 *
 * @param {String} location
 *    The location of the error.
 * @param {String} error
 *    The error message.
 * @returns {Object}
 *    Returns an object containing both the error and the location.
 */
module.exports.createAndLogError = function(location, error) {
  logger.log('error', location + ': ' + error);
  return {
    error: error,
    message: location
  };
};