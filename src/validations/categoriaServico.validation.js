const Joi = require("joi")

const createCategoriaServicoSchema = Joi.object({
  nome: Joi.string().max(100).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
    "any.required": "Nome é obrigatório",
  }),
  descricao: Joi.string().allow(null, ""),
})

const updateCategoriaServicoSchema = Joi.object({
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  descricao: Joi.string().allow(null, ""),
})

module.exports = {
  createCategoriaServicoSchema,
  updateCategoriaServicoSchema,
}
