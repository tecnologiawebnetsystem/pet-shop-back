const Joi = require("joi")

const createClienteSchema = Joi.object({
  usuario_id: Joi.number().required().messages({
    "number.base": "ID do usuário deve ser um número",
    "any.required": "ID do usuário é obrigatório",
  }),
  cpf: Joi.string().max(14).allow(null, "").messages({
    "string.max": "CPF deve ter no máximo {#limit} caracteres",
  }),
  endereco: Joi.string().max(255).allow(null, "").messages({
    "string.max": "Endereço deve ter no máximo {#limit} caracteres",
  }),
  cidade: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Cidade deve ter no máximo {#limit} caracteres",
  }),
  estado: Joi.string().max(2).allow(null, "").messages({
    "string.max": "Estado deve ter no máximo {#limit} caracteres",
  }),
  cep: Joi.string().max(9).allow(null, "").messages({
    "string.max": "CEP deve ter no máximo {#limit} caracteres",
  }),
  data_nascimento: Joi.date().allow(null).messages({
    "date.base": "Data de nascimento deve ser uma data válida",
  }),
  observacoes: Joi.string().allow(null, ""),
})

const updateClienteSchema = Joi.object({
  cpf: Joi.string().max(14).allow(null, "").messages({
    "string.max": "CPF deve ter no máximo {#limit} caracteres",
  }),
  endereco: Joi.string().max(255).allow(null, "").messages({
    "string.max": "Endereço deve ter no máximo {#limit} caracteres",
  }),
  cidade: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Cidade deve ter no máximo {#limit} caracteres",
  }),
  estado: Joi.string().max(2).allow(null, "").messages({
    "string.max": "Estado deve ter no máximo {#limit} caracteres",
  }),
  cep: Joi.string().max(9).allow(null, "").messages({
    "string.max": "CEP deve ter no máximo {#limit} caracteres",
  }),
  data_nascimento: Joi.date().allow(null).messages({
    "date.base": "Data de nascimento deve ser uma data válida",
  }),
  observacoes: Joi.string().allow(null, ""),
})

module.exports = {
  createClienteSchema,
  updateClienteSchema,
}
