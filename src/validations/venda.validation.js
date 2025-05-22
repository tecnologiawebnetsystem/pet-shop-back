const Joi = require("joi")

const itemVendaSchema = Joi.object({
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

const createVendaSchema = Joi.object({
  cliente_id: Joi.number().required().messages({
    "number.base": "ID do cliente deve ser um número",
    "any.required": "ID do cliente é obrigatório",
  }),
  funcionario_id: Joi.number().allow(null).messages({
    "number.base": "ID do funcionário deve ser um número",
  }),
  itens: Joi.array().items(itemVendaSchema).min(1).required().messages({
    "array.base": "Itens deve ser um array",
    "array.min": "É necessário informar pelo menos um item",
    "any.required": "Itens são obrigatórios",
  }),
  desconto: Joi.number().precision(2).min(0).default(0).messages({
    "number.base": "Desconto deve ser um número",
    "number.precision": "Desconto deve ter no máximo 2 casas decimais",
    "number.min": "Desconto não pode ser negativo",
  }),
  forma_pagamento: Joi.string()
    .valid("dinheiro", "cartao_credito", "cartao_debito", "pix", "boleto")
    .required()
    .messages({
      "any.only": "Forma de pagamento deve ser dinheiro, cartao_credito, cartao_debito, pix ou boleto",
      "any.required": "Forma de pagamento é obrigatória",
    }),
  observacoes: Joi.string().allow(null, ""),
})

const updateVendaSchema = Joi.object({
  forma_pagamento: Joi.string().valid("dinheiro", "cartao_credito", "cartao_debito", "pix", "boleto").messages({
    "any.only": "Forma de pagamento deve ser dinheiro, cartao_credito, cartao_debito, pix ou boleto",
  }),
  status: Joi.string().valid("pendente", "concluida", "cancelada").messages({
    "any.only": "Status deve ser pendente, concluida ou cancelada",
  }),
  observacoes: Joi.string().allow(null, ""),
})

module.exports = {
  createVendaSchema,
  updateVendaSchema,
  itemVendaSchema,
}
