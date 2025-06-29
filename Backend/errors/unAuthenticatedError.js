const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("./customApiError.js");

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;
