const BadRequestError = require("./badRequestError.js");
const UnauthenticatedError = require("./unAuthenticatedError.js");
const NotFoundError = require("./notFoundError.js");
const CustomAPIError = require("./customApiError.js");

module.exports = {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
  CustomAPIError,
};
