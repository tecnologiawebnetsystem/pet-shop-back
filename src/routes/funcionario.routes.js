const express = require("express")
const FuncionarioController = require("../controllers/FuncionarioController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createFuncionarioSchema, updateFuncionarioSchema } = require("../validations/funcionario.validation")

const router = express.Router()

/**
 * @swagger
 * /funcionarios:
 *   get:
 *     summary: Listar todos os funcionários
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: cargo
 *         schema:
 *           type: string
 *       - in: query
 *         name: especialidade
 *         schema:
 *           type: string
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
 *         description: Lista de funcionários
 */
router.get("/", authMiddleware, authorize("admin"), FuncionarioController.findAll)

/**
 * @swagger
 * /funcionarios/{id}:
 *   get:
 *     summary: Obter funcionário por ID
 *     tags: [Funcionários]
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
 *         description: Detalhes do funcionário
 *       404:
 *         description: Funcionário não encontrado
 */
router.get("/:id", authMiddleware, FuncionarioController.findById)

/**
 * @swagger
 * /funcionarios:
 *   post:
 *     summary: Criar novo funcionário
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario_id
 *             properties:
 *               usuario_id:
 *                 type: integer
 *               cargo:
 *                 type: string
 *               salario:
 *                 type: number
 *               data_contratacao:
 *                 type: string
 *                 format: date
 *               documento:
 *                 type: string
 *               especialidade:
 *                 type: string
 *     responses:
 *       201:
 *         description: Funcionário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, authorize("admin"), validate(createFuncionarioSchema), FuncionarioController.create)

/**
 * @swagger
 * /funcionarios/{id}:
 *   put:
 *     summary: Atualizar funcionário
 *     tags: [Funcionários]
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
 *               cargo:
 *                 type: string
 *               salario:
 *                 type: number
 *               data_contratacao:
 *                 type: string
 *                 format: date
 *               documento:
 *                 type: string
 *               especialidade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Funcionário atualizado com sucesso
 *       404:
 *         description: Funcionário não encontrado
 */
router.put("/:id", authMiddleware, authorize("admin"), validate(updateFuncionarioSchema), FuncionarioController.update)

/**
 * @swagger
 * /funcionarios/{id}:
 *   delete:
 *     summary: Excluir funcionário
 *     tags: [Funcionários]
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
 *         description: Funcionário excluído com sucesso
 *       404:
 *         description: Funcionário não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin"), FuncionarioController.delete)

/**
 * @swagger
 * /funcionarios/{id}/agendamentos:
 *   get:
 *     summary: Listar agendamentos do funcionário
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, em_andamento, concluido, cancelado]
 *     responses:
 *       200:
 *         description: Lista de agendamentos do funcionário
 *       404:
 *         description: Funcionário não encontrado
 */
router.get("/:id/agendamentos", authMiddleware, FuncionarioController.findAgendamentos)

/**
 * @swagger
 * /funcionarios/{id}/tarefas:
 *   get:
 *     summary: Listar tarefas do funcionário
 *     tags: [Funcionários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, em_andamento, concluida, cancelada]
 *       - in: query
 *         name: prioridade
 *         schema:
 *           type: string
 *           enum: [baixa, media, alta]
 *     responses:
 *       200:
 *         description: Lista de tarefas do funcionário
 *       404:
 *         description: Funcionário não encontrado
 */
router.get("/:id/tarefas", authMiddleware, FuncionarioController.findTarefas)

module.exports = router
