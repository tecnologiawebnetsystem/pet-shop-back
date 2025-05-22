const Joi = require("joi")

const createTarefaSchema = Joi.object({
  funcionario_id: Joi.number().allow(null).messages({
    "number.base": "ID do funcionário deve ser um número",
  }),
  titulo: Joi.string().max(100).required().messages({
    "string.empty": "Título é obrigatório",
    "string.max": "Título deve ter no máximo {#limit} caracteres",
    "any.required": "Título é obrigatório",
  }),
  descricao: Joi.string().allow(null, ""),
  data: Joi.date().required().messages({
    "date.base": "Data deve ser uma data válida",
    "any.required": "Data é obrigatória",
  }),
  hora: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.pattern.base": "Hora deve estar no formato HH:MM ou HH:MM:SS",
      "any.required": "Hora é obrigatória",
    }),
  prioridade: Joi.string().valid("baixa", "media", "alta").default("media").messages({
    "any.only": "Prioridade deve ser baixa, media ou alta",
  }),
  status: Joi.string().valid("pendente", "em_andamento", "concluida", "cancelada").default("pendente").messages({
    "any.only": "Status deve ser pendente, em_andamento, concluida ou cancelada",
  }),
})

const updateTarefaSchema = Joi.object({
  funcionario_id: Joi.number().allow(null).messages({
    "number.base": "ID do funcionário deve ser um número",
  }),
  titulo: Joi.string().max(100).messages({
    "string.max": "Título deve ter no máximo {#limit} caracteres",
  }),
  descricao: Joi.string().allow(null, ""),
  data: Joi.date().messages({
    "date.base": "Data deve ser uma data válida",
  }),
  hora: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      "string.pattern.base": "Hora deve estar no formato HH:MM ou HH:MM:SS",
    }),
  prioridade: Joi.string().valid("baixa", "media", "alta").messages({
    "any.only": "Prioridade deve ser baixa, media ou alta",
  }),
  status: Joi.string().valid("pendente", "em_andamento", "concluida", "cancelada").messages({
    "any.only": "Status deve ser pendente, em_andamento, concluida ou cancelada",
  }),
})

module.exports = {
  createTarefaSchema,
  updateTarefaSchema,
}
