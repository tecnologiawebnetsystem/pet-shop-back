const express = require("express")
const AgendamentoController = require("../controllers/AgendamentoController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createAgendamentoSchema, updateAgendamentoSchema } = require("../validations/agendamento.validation")

const router = express.Router()

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Listar todos os agendamentos
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pet_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: servico_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: funcionario_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, em_andamento, concluido, cancelado]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 */
router.get("/", authMiddleware, AgendamentoController.findAll)

/**
 * @swagger
 * /agendamentos/{id}:
 *   get:
 *     summary: Obter agendamento por ID
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do agendamento
 *       404:
 *         description: Agendamento não encontrado
 */
router.get("/:id", authMiddleware, AgendamentoController.findById)

/**
 * @swagger
 * /agendamentos:
 *   post:
 *     summary: Criar novo agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - pet_id
 *               - servico_id
 *               - data
 *               - hora_inicio
 *               - hora_fim
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               pet_id:
 *                 type: integer
 *               servico_id:
 *                 type: integer
 *               funcionario_id:
 *                 type: integer
 *               data:
 *                 type: string
 *                 format: date
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *               hora_fim:
 *                 type: string
 *                 format: time
 *               status:
 *                 type: string
 *                 enum: [agendado, confirmado, em_andamento, concluido, cancelado]
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agendamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, validate(createAgendamentoSchema), AgendamentoController.create)

/**
 * @swagger
 * /agendamentos/{id}:
 *   put:
 *     summary: Atualizar agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               pet_id:
 *                 type: integer
 *               servico_id:
 *                 type: integer
 *               funcionario_id:
 *                 type: integer
 *               data:
 *                 type: string
 *                 format: date
 *               hora_inicio:
 *                 type: string
 *                 format: time
 *               hora_fim:
 *                 type: string
 *                 format: time
 *               status:
 *                 type: string
 *                 enum: [agendado, confirmado, em_andamento, concluido, cancelado]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agendamento atualizado com sucesso
 *       404:
 *         description: Agendamento não encontrado
 */
router.put("/:id", authMiddleware, validate(updateAgendamentoSchema), AgendamentoController.update)

/**
 * @swagger
 * /agendamentos/{id}:
 *   delete:
 *     summary: Excluir agendamento
 *     tags: [Agendamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Agendamento excluído com sucesso
 *       404:
 *         description: Agendamento não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin", "funcionario"), AgendamentoController.delete)

module.exports = router
