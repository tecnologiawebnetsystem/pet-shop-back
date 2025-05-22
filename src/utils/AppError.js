class AppError extends Error {
  constructor(message, statusCode = 400, code = "BAD_REQUEST") {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = "AppError"
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
