const Joi = require("joi")

const createUsuarioSchema = Joi.object({
  nome: Joi.string().max(100).required().messages({
    "string.empty": "Nome é obrigatório",
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
    "any.required": "Nome é obrigatório",
  }),
  email: Joi.string().email().max(100).required().messages({
    "string.email": "Email inválido",
    "string.empty": "Email é obrigatório",
    "string.max": "Email deve ter no máximo {#limit} caracteres",
    "any.required": "Email é obrigatório",
  }),
  senha: Joi.string().min(6).required().messages({
    "string.empty": "Senha é obrigatória",
    "string.min": "Senha deve ter no mínimo {#limit} caracteres",
    "any.required": "Senha é obrigatória",
  }),
  telefone: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Telefone deve ter no máximo {#limit} caracteres",
  }),
  tipo: Joi.string().valid("cliente", "funcionario", "admin").required().messages({
    "string.empty": "Tipo é obrigatório",
    "any.only": "Tipo deve ser cliente, funcionario ou admin",
    "any.required": "Tipo é obrigatório",
  }),
  status: Joi.string().valid("ativo", "inativo").default("ativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

const updateUsuarioSchema = Joi.object({
  nome: Joi.string().max(100).messages({
    "string.max": "Nome deve ter no máximo {#limit} caracteres",
  }),
  email: Joi.string().email().max(100).messages({
    "string.email": "Email inválido",
    "string.max": "Email deve ter no máximo {#limit} caracteres",
  }),
  telefone: Joi.string().max(20).allow(null, "").messages({
    "string.max": "Telefone deve ter no máximo {#limit} caracteres",
  }),
  status: Joi.string().valid("ativo", "inativo").messages({
    "any.only": "Status deve ser ativo ou inativo",
  }),
})

const changePasswordSchema = Joi.object({
  senhaAtual: Joi.string().required().messages({
    "string.empty": "Senha atual é obrigatória",
    "any.required": "Senha atual é obrigatória",
  }),
  novaSenha: Joi.string().min(6).required().messages({
    "string.empty": "Nova senha é obrigatória",
    "string.min": "Nova senha deve ter no mínimo {#limit} caracteres",
    "any.required": "Nova senha é obrigatória",
  }),
})

module.exports = {
  createUsuarioSchema,
  updateUsuarioSchema,
  changePasswordSchema,
}
