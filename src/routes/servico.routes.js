const express = require("express")
const ServicoController = require("../controllers/ServicoController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createServicoSchema, updateServicoSchema } = require("../validations/servico.validation")

const router = express.Router()

/**
 * @swagger
 * /servicos:
 *   get:
 *     summary: Listar todos os serviços
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ativo, inativo]
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
 *         description: Lista de serviços
 */
router.get("/", authMiddleware, ServicoController.findAll)

/**
 * @swagger
 * /servicos/{id}:
 *   get:
 *     summary: Obter serviço por ID
 *     tags: [Serviços]
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
 *         description: Detalhes do serviço
 *       404:
 *         description: Serviço não encontrado
 */
router.get("/:id", authMiddleware, ServicoController.findById)

/**
 * @swagger
 * /servicos:
 *   post:
 *     summary: Criar novo serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - preco
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               duracao:
 *                 type: integer
 *               categoria_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createServicoSchema),
  ServicoController.create,
)

/**
 * @swagger
 * /servicos/{id}:
 *   put:
 *     summary: Atualizar serviço
 *     tags: [Serviços]
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
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               duracao:
 *                 type: integer
 *               categoria_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *       404:
 *         description: Serviço não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateServicoSchema),
  ServicoController.update,
)

/**
 * @swagger
 * /servicos/{id}:
 *   delete:
 *     summary: Excluir serviço
 *     tags: [Serviços]
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
 *         description: Serviço excluído com sucesso
 *       404:
 *         description: Serviço não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin"), ServicoController.delete)

/**
 * @swagger
 * /servicos/{id}/agendamentos:
 *   get:
 *     summary: Listar agendamentos do serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendado, confirmado, em_andamento, concluido, cancelado]
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
 *     responses:
 *       200:
 *         description: Lista de agendamentos do serviço
 *       404:
 *         description: Serviço não encontrado
 */
router.get("/:id/agendamentos", authMiddleware, ServicoController.findAgendamentos)

module.exports = router
