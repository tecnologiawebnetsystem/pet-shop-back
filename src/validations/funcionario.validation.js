const Joi = require("joi")

const createFuncionarioSchema = Joi.object({
  usuario_id: Joi.number().required().messages({
    "number.base": "ID do usuário deve ser um número",
    "any.required": "ID do usuário é obrigatório",
  }),
  cargo: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Cargo deve ter no máximo {#limit} caracteres",
  }),
  salario: Joi.number().precision(2).allow(null).messages({
    "number.base": "Salário deve ser um número",
    "number.precision": "Salário deve ter no máximo 2 casas decimais",
  }),
  data_contratacao: Joi.date().allow(null).messages({
    "date.base": "Data de contratação deve ser uma data válida",
  }),
  documento: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Documento deve ter no máximo {#limit} caracteres",
  }),
  especialidade: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Especialidade deve ter no máximo {#limit} caracteres",
  }),
})

const updateFuncionarioSchema = Joi.object({
  cargo: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Cargo deve ter no máximo {#limit} caracteres",
  }),
  salario: Joi.number().precision(2).allow(null).messages({
    "number.base": "Salário deve ser um número",
    "number.precision": "Salário deve ter no máximo 2 casas decimais",
  }),
  data_contratacao: Joi.date().allow(null).messages({
    "date.base": "Data de contratação deve ser uma data válida",
  }),
  documento: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Documento deve ter no máximo {#limit} caracteres",
  }),
  especialidade: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Especialidade deve ter no máximo {#limit} caracteres",
  }),
})

module.exports = {
  createFuncionarioSchema,
  updateFuncionarioSchema,
}
