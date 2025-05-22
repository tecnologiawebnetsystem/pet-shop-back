const Joi = require("joi")

const createProdutoSchema = Joi.object({
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
  preco_custo: Joi.number().precision(2).allow(null).messages({
    "number.base": "Preço de custo deve ser um número",
    "number.precision": "Preço de custo deve ter no máximo 2 casas decimais",
  }),
  estoque: Joi.number().integer().default(0).messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
  }),
  estoque_minimo: Joi.number().integer().allow(null).default(0).messages({
    "number.base": "Estoque mínimo deve ser um número",
    "number.integer": "Estoque mínimo deve ser um número inteiro",
  }),
  categoria_id: Joi.number().allow(null).messages({
    "number.base": "ID da categoria deve ser um número",
  }),
  fornecedor_id: Joi.number().allow(null).messages({
    "number.base": "ID do fornecedor deve ser um número",
  }),
  codigo_barras: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Código de barras deve ter no máximo {#limit} caracteres",
  }),
  status: Joi.string().valid("ativo", "inativo").default("ativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

const updateProdutoSchema = Joi.object({
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  descricao: Joi.string().allow(null, ""),
  preco: Joi.number().precision(2).messages({
    "number.base": "Preço deve ser um número",
    "number.precision": "Preço deve ter no máximo 2 casas decimais",
  }),
  preco_custo: Joi.number().precision(2).allow(null).messages({
    "number.base": "Preço de custo deve ser um número",
    "number.precision": "Preço de custo deve ter no máximo 2 casas decimais",
  }),
  estoque: Joi.number().integer().messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
  }),
  estoque_minimo: Joi.number().integer().allow(null).messages({
    "number.base": "Estoque mínimo deve ser um número",
    "number.integer": "Estoque mínimo deve ser um número inteiro",
  }),
  categoria_id: Joi.number().allow(null).messages({
    "number.base": "ID da categoria deve ser um número",
  }),
  fornecedor_id: Joi.number().allow(null).messages({
    "number.base": "ID do fornecedor deve ser um número",
  }),
  codigo_barras: Joi.string().max(50).allow(null, "").messages({
    "string.max": "Código de barras deve ter no máximo {#limit} caracteres",
  }),
  status: Joi.string().valid("ativo", "inativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

const updateEstoqueSchema = Joi.object({
  quantidade: Joi.number().integer().positive().required().messages({
    "number.base": "Quantidade deve ser um número",
    "number.integer": "Quantidade deve ser um número inteiro",
    "number.positive": "Quantidade deve ser um número positivo",
    "any.required": "Quantidade é obrigatória",
  }),
  operacao: Joi.string().valid("adicionar", "remover").default("adicionar").messages({
    "any.only": "Operação deve ser adicionar ou remover",
  }),
})

module.exports = {
  createProdutoSchema,
  updateProdutoSchema,
  updateEstoqueSchema,
}
