const Joi = require("joi")

const createAgendamentoSchema = Joi.object({
  cliente_id: Joi.number().required().messages({
    "number.base": "ID do cliente deve ser um número",
    "any.required": "ID do cliente é obrigatório",
  }),
  pet_id: Joi.number().required().messages({
    "number.base": "ID do pet deve ser um número",
    "any.required": "ID do pet é obrigatório",
  }),
  servico_id: Joi.number().required().messages({
    "number.base": "ID do serviço deve ser um número",
    "any.required": "ID do serviço é obrigatório",
  }),
  funcionario_id: Joi.number().allow(null).messages({
    "number.base": "ID do funcionário deve ser um número",
  }),
  data: Joi.date().required().messages({
    "date.base": "Data deve ser uma data válida",
    "any.required": "Data é obrigatória",
  }),
  hora_inicio: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.pattern.base": "Hora de início deve estar no formato HH:MM ou HH:MM:SS",
      "any.required": "Hora de início é obrigatória",
    }),
  hora_fim: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .required()
    .messages({
      "string.pattern.base": "Hora de fim deve estar no formato HH:MM ou HH:MM:SS",
      "any.required": "Hora de fim é obrigatória",
    }),
  status: Joi.string()
    .valid("agendado", "confirmado", "em_andamento", "concluido", "cancelado")
    .default("agendado")
    .messages({
      "any.only": "Status deve ser agendado, confirmado, em_andamento, concluido ou cancelado",
    }),
  observacoes: Joi.string().allow(null, ""),
})

const updateAgendamentoSchema = Joi.object({
  cliente_id: Joi.number().messages({
    "number.base": "ID do cliente deve ser um número",
  }),
  pet_id: Joi.number().messages({
    "number.base": "ID do pet deve ser um número",
  }),
  servico_id: Joi.number().messages({
    "number.base": "ID do serviço deve ser um número",
  }),
  funcionario_id: Joi.number().allow(null).messages({
    "number.base": "ID do funcionário deve ser um número",
  }),
  data: Joi.date().messages({
    "date.base": "Data deve ser uma data válida",
  }),
  hora_inicio: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      "string.pattern.base": "Hora de início deve estar no formato HH:MM ou HH:MM:SS",
    }),
  hora_fim: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
    .messages({
      "string.pattern.base": "Hora de fim deve estar no formato HH:MM ou HH:MM:SS",
    }),
  status: Joi.string().valid("agendado", "confirmado", "em_andamento", "concluido", "cancelado").messages({
    "any.only": "Status deve ser agendado, confirmado, em_andamento, concluido ou cancelado",
  }),
  observacoes: Joi.string().allow(null, ""),
})

module.exports = {
  createAgendamentoSchema,
  updateAgendamentoSchema,
}
