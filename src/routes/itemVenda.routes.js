const express = require("express")
const ItemVendaController = require("../controllers/ItemVendaController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createItemVendaSchema, updateItemVendaSchema } = require("../validations/itemVenda.validation")

const router = express.Router()

/**
 * @swagger
 * /itens-venda:
 *   get:
 *     summary: Listar todos os itens de venda
 *     tags: [Itens de Venda]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: venda_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: produto_id
 *         schema:
 *           type: integer
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
 *         description: Lista de itens de venda
 */
router.get("/", authMiddleware, ItemVendaController.findAll)

/**
 * @swagger
 * /itens-venda/{id}:
 *   get:
 *     summary: Obter item de venda por ID
 *     tags: [Itens de Venda]
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
 *         description: Detalhes do item de venda
 *       404:
 *         description: Item de venda não encontrado
 */
router.get("/:id", authMiddleware, ItemVendaController.findById)

/**
 * @swagger
 * /itens-venda:
 *   post:
 *     summary: Criar novo item de venda
 *     tags: [Itens de Venda]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - venda_id
 *               - produto_id
 *               - quantidade
 *             properties:
 *               venda_id:
 *                 type: integer
 *               produto_id:
 *                 type: integer
 *               quantidade:
 *                 type: integer
 *               valor_unitario:
 *                 type: number
 *               desconto:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item de venda criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createItemVendaSchema),
  ItemVendaController.create,
)

/**
 * @swagger
 * /itens-venda/{id}:
 *   put:
 *     summary: Atualizar item de venda
 *     tags: [Itens de Venda]
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
 *               quantidade:
 *                 type: integer
 *               valor_unitario:
 *                 type: number
 *               desconto:
 *                 type: number
 *     responses:
 *       200:
 *         description: Item de venda atualizado com sucesso
 *       404:
 *         description: Item de venda não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateItemVendaSchema),
  ItemVendaController.update,
)

/**
 * @swagger
 * /itens-venda/{id}:
 *   delete:
 *     summary: Excluir item de venda
 *     tags: [Itens de Venda]
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
 *         description: Item de venda excluído com sucesso
 *       404:
 *         description: Item de venda não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin", "funcionario"), ItemVendaController.delete)

module.exports = router
