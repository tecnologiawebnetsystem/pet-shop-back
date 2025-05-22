const express = require("express")
const ClienteController = require("../controllers/ClienteController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createClienteSchema, updateClienteSchema } = require("../validations/cliente.validation")

const router = express.Router()

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Listar todos os clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: cpf
 *         schema:
 *           type: string
 *       - in: query
 *         name: cidade
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
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
 *         description: Lista de clientes
 */
router.get("/", authMiddleware, ClienteController.findAll)

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obter cliente por ID
 *     tags: [Clientes]
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
 *         description: Detalhes do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get("/:id", authMiddleware, ClienteController.findById)

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Criar novo cliente
 *     tags: [Clientes]
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
 *               cpf:
 *                 type: string
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, authorize("admin"), validate(createClienteSchema), ClienteController.create)

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Atualizar cliente
 *     tags: [Clientes]
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
 *               cpf:
 *                 type: string
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.put("/:id", authMiddleware, validate(updateClienteSchema), ClienteController.update)

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Excluir cliente
 *     tags: [Clientes]
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
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin"), ClienteController.delete)

/**
 * @swagger
 * /clientes/{id}/pets:
 *   get:
 *     summary: Listar pets do cliente
 *     tags: [Clientes]
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
 *         description: Lista de pets do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get("/:id/pets", authMiddleware, ClienteController.findPets)

/**
 * @swagger
 * /clientes/{id}/agendamentos:
 *   get:
 *     summary: Listar agendamentos do cliente
 *     tags: [Clientes]
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
 *     responses:
 *       200:
 *         description: Lista de agendamentos do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get("/:id/agendamentos", authMiddleware, ClienteController.findAgendamentos)

/**
 * @swagger
 * /clientes/{id}/compras:
 *   get:
 *     summary: Listar compras do cliente
 *     tags: [Clientes]
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
 *           enum: [pendente, concluida, cancelada]
 *     responses:
 *       200:
 *         description: Lista de compras do cliente
 *       404:
 *         description: Cliente não encontrado
 */
router.get("/:id/compras", authMiddleware, ClienteController.findCompras)

module.exports = router
