const Joi = require("joi")

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
  senha: Joi.string().required().messages({
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
})

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "any.required": "Email é obrigatório",
  }),
})

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Token é obrigatório",
    "any.required": "Token é obrigatório",
  }),
  senha: Joi.string().min(6).required().messages({
    "string.empty": "Senha é obrigatória",
    "string.min": "Senha deve ter no mínimo {#limit} caracteres",
    "any.required": "Senha é obrigatória",
  }),
})

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
}
