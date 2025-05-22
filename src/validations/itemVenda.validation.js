const Joi = require("joi")

const createItemVendaSchema = Joi.object({
  venda_id: Joi.number().required().messages({
    "number.base": "ID da venda deve ser um número",
    "any.required": "ID da venda é obrigatório",
  }),
  produto_id: Joi.number().required().messages({
    "number.base": "ID do produto deve ser um número",
    "any.required": "ID do produto é obrigatório",
  }),
  quantidade: Joi.number().integer().positive().required().messages({
    "number.base": "Quantidade deve ser um número",
    "number.integer": "Quantidade deve ser um número inteiro",
    "number.positive": "Quantidade deve ser um número positivo",
    "any.required": "Quantidade é obrigatória",
  }),
  valor_unitario: Joi.number().precision(2).messages({
    "number.base": "Valor unitário deve ser um número",
    "number.precision": "Valor unitário deve ter no máximo 2 casas decimais",
  }),
  desconto: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "Desconto deve ser um número",
    "number.precision": "Desconto deve ter no máximo 2 casas decimais",
    "number.min": "Desconto não pode ser negativo",
  }),
})

const updateItemVendaSchema = Joi.object({
  quantidade: Joi.number().integer().positive().messages({
    "number.base": "Quantidade deve ser um número",
    "number.integer": "Quantidade deve ser um número inteiro",
    "number.positive": "Quantidade deve ser um número positivo",
  }),
  valor_unitario: Joi.number().precision(2).messages({
    "number.base": "Valor unitário deve ser um número",
    "number.precision": "Valor unitário deve ter no máximo 2 casas decimais",
  }),
  desconto: Joi.number().precision(2).min(0).messages({
    "number.base": "Desconto deve ser um número",
    "number.precision": "Desconto deve ter no máximo 2 casas decimais",
    "number.min": "Desconto não pode ser negativo",
  }),
})

module.exports = {
  createItemVendaSchema,
  updateItemVendaSchema,
}
