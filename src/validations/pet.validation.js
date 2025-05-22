const Joi = require("joi")

const createPetSchema = Joi.object({
  cliente_id: Joi.number().required().messages({
    "number.base": "ID do cliente deve ser um número",
    "any.required": "ID do cliente é obrigatório",
  }),
  nome: Joi.string().max(100).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
    "any.required": "Nome é obrigatório",
  }),
  especie: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Espécie deve ter no máximo {#limit} caracteres",
  }),
  raca: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Raça deve ter no máximo {#limit} caracteres",
  }),
  data_nascimento: Joi.date().allow(null).messages({
    "date.base": "Data de nascimento deve ser uma data válida",
  }),
  peso: Joi.number().precision(2).allow(null).messages({
    "number.base": "Peso deve ser um número",
    "number.precision": "Peso deve ter no máximo 2 casas decimais",
  }),
  sexo: Joi.string().valid("macho", "femea").allow(null).messages({
    "any.only": "Sexo deve ser macho ou femea",
  }),
  cor: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Cor deve ter no máximo {#limit} caracteres",
  }),
  observacoes: Joi.string().allow(null, ""),
})

const updatePetSchema = Joi.object({
  cliente_id: Joi.number().messages({
    "number.base": "ID do cliente deve ser um número",
  }),
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  especie: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Espécie deve ter no máximo {#limit} caracteres",
  }),
  raca: Joi.string().max(100).allow(null, "").messages({
    "string.max": "Raça deve ter no máximo {#limit} caracteres",
  }),
  data_nascimento: Joi.date().allow(null).messages({
    "date.base": "Data de nascimento deve ser uma data válida",
  }),
  peso: Joi.number().precision(2).allow(null).messages({
    "number.base": "Peso deve ser um número",
    "number.precision": "Peso deve ter no máximo 2 casas decimais",
  }),
  sexo: Joi.string().valid("macho", "femea").allow(null).messages({
    "any.only": "Sexo deve ser macho ou femea",
  }),
  cor: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Cor deve ter no máximo {#limit} caracteres",
  }),
  observacoes: Joi.string().allow(null, ""),
})

module.exports = {
  createPetSchema,
  updatePetSchema,
}
