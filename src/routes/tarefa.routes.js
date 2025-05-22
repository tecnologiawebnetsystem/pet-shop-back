const express = require("express")
const TarefaController = require("../controllers/TarefaController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createTarefaSchema, updateTarefaSchema } = require("../validations/tarefa.validation")

const router = express.Router()

/**
 * @swagger
 * /tarefas:
 *   get:
 *     summary: Listar todas as tarefas
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: funcionario_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
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
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, em_andamento, concluida, cancelada]
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
 *         description: Lista de tarefas
 */
router.get("/", authMiddleware, TarefaController.findAll)

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     summary: Obter tarefa por ID
 *     tags: [Tarefas]
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
 *         description: Detalhes da tarefa
 *       404:
 *         description: Tarefa não encontrada
 */
router.get("/:id", authMiddleware, TarefaController.findById)

/**
 * @swagger
 * /tarefas:
 *   post:
 *     summary: Criar nova tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - data
 *               - hora
 *             properties:
 *               funcionario_id:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               prioridade:
 *                 type: string
 *                 enum: [baixa, media, alta]
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida, cancelada]
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, validate(createTarefaSchema), TarefaController.create)

/**
 * @swagger
 * /tarefas/{id}:
 *   put:
 *     summary: Atualizar tarefa
 *     tags: [Tarefas]
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
 *               funcionario_id:
 *                 type: integer
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date
 *               hora:
 *                 type: string
 *                 format: time
 *               prioridade:
 *                 type: string
 *                 enum: [baixa, media, alta]
 *               status:
 *                 type: string
 *                 enum: [pendente, em_andamento, concluida, cancelada]
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */
router.put("/:id", authMiddleware, validate(updateTarefaSchema), TarefaController.update)

/**
 * @swagger
 * /tarefas/{id}:
 *   delete:
 *     summary: Excluir tarefa
 *     tags: [Tarefas]
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
 *         description: Tarefa excluída com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */
router.delete("/:id", authMiddleware, TarefaController.delete)

module.exports = router
