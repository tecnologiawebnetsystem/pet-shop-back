const Joi = require("joi")

const createFornecedorSchema = Joi.object({
  nome: Joi.string().max(100).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
    "any.required": "Nome é obrigatório",
  }),
  cnpj: Joi.string().max(18).allow(null, "").messages({
    "string.max": "CNPJ deve ter no máximo {#limit} caracteres",
  }),
  telefone: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Telefone deve ter no máximo {#limit} caracteres",
  }),
  email: Joi.string().email().max(100).allow(null, "").messages({
    "string.email": "Email inválido",
    "string.max": "Email deve ter no máximo {#limit} caracteres",
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
  contato: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Contato deve ter no máximo {#limit} caracteres",
  }),
})

const updateFornecedorSchema = Joi.object({
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  cnpj: Joi.string().max(18).allow(null, "").messages({
    "string.max": "CNPJ deve ter no máximo {#limit} caracteres",
  }),
  telefone: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Telefone deve ter no máximo {#limit} caracteres",
  }),
  email: Joi.string().email().max(100).allow(null, "").messages({
    "string.email": "Email inválido",
    "string.max": "Email deve ter no máximo {#limit} caracteres",
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
  contato: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Contato deve ter no máximo {#limit} caracteres",
  }),
})

module.exports = {
  createFornecedorSchema,
  updateFornecedorSchema,
}
