const AppError = require("../utils/AppError")

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      return next(new AppError(errorMessage, 400, "VALIDATION_ERROR"))
    }

    return next()
  }
}

module.exports = validate
