const Joi = require("joi")

const createServicoSchema = Joi.object({
  nome: Joi.string().max(100).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
    "any.required": "Nome é obrigatório",
  }),
  descricao: Joi.string().allow(null, ""),
  preco: Joi.number().precision(2).required().messages({
    "number.base": "Preço deve ser um número",
    "number.precision": "Preço deve ter no máximo 2 casas decimais",
    "any.required": "Preço é obrigatório",
  }),
  duracao: Joi.number().integer().allow(null).messages({
    "number.base": "Duração deve ser um número",
    "number.integer": "Duração deve ser um número inteiro",
  }),
  categoria_id: Joi.number().allow(null).messages({
    "number.base": "ID da categoria deve ser um número",
  }),
  status: Joi.string().valid("ativo", "inativo").default("ativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

const updateServicoSchema = Joi.object({
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  descricao: Joi.string().allow(null, ""),
  preco: Joi.number().precision(2).messages({
    "number.base": "Preço deve ser um número",
    "number.precision": "Preço deve ter no máximo 2 casas decimais",
  }),
  duracao: Joi.number().integer().allow(null).messages({
    "number.base": "Duração deve ser um número",
    "number.integer": "Duração deve ser um número inteiro",
  }),
  categoria_id: Joi.number().allow(null).messages({
    "number.base": "ID da categoria deve ser um número",
  }),
  status: Joi.string().valid("ativo", "inativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

module.exports = {
  createServicoSchema,
  updateServicoSchema,
}
