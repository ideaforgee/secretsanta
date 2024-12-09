/**
 * Common response format for API responses
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (e.g. 200, 400, 500)
 * @param {string} message - Response message
 * @param {Object|Array} [data] - Data to be sent in the response (optional)
 * @param {Object} [errors] - Errors to be sent in the response (optional)
 */
const sendResponse = (res, statusCode, message, data = null, errors = null) => {
    res.status(statusCode).json({
      status: statusCode,
      message: message,
      data: data,
      errors: errors,
    });
};

module.exports = sendResponse;