const express = require("express")
const VendaController = require("../controllers/VendaController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createVendaSchema, updateVendaSchema } = require("../validations/venda.validation")

const router = express.Router()

/**
 * @swagger
 * /vendas:
 *   get:
 *     summary: Listar todas as vendas
 *     tags: [Vendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: funcionario_id
 *         schema:
 *           type: integer
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
 *         name: forma_pagamento
 *         schema:
 *           type: string
 *           enum: [dinheiro, cartao_credito, cartao_debito, pix, boleto]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, concluida, cancelada]
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
 *         description: Lista de vendas
 */
router.get("/", authMiddleware, VendaController.findAll)

/**
 * @swagger
 * /vendas/{id}:
 *   get:
 *     summary: Obter venda por ID
 *     tags: [Vendas]
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
 *         description: Detalhes da venda
 *       404:
 *         description: Venda não encontrada
 */
router.get("/:id", authMiddleware, VendaController.findById)

/**
 * @swagger
 * /vendas:
 *   post:
 *     summary: Criar nova venda
 *     tags: [Vendas]
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
 *               - itens
 *               - forma_pagamento
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               funcionario_id:
 *                 type: integer
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - produto_id
 *                     - quantidade
 *                   properties:
 *                     produto_id:
 *                       type: integer
 *                     quantidade:
 *                       type: integer
 *                     valor_unitario:
 *                       type: number
 *                     desconto:
 *                       type: number
 *               desconto:
 *                 type: number
 *               forma_pagamento:
 *                 type: string
 *                 enum: [dinheiro, cartao_credito, cartao_debito, pix, boleto]
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, validate(createVendaSchema), VendaController.create)

/**
 * @swagger
 * /vendas/{id}:
 *   put:
 *     summary: Atualizar venda
 *     tags: [Vendas]
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
 *               forma_pagamento:
 *                 type: string
 *                 enum: [dinheiro, cartao_credito, cartao_debito, pix, boleto]
 *               status:
 *                 type: string
 *                 enum: [pendente, concluida, cancelada]
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *       404:
 *         description: Venda não encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateVendaSchema),
  VendaController.update,
)

/**
 * @swagger
 * /vendas/{id}:
 *   delete:
 *     summary: Excluir venda
 *     tags: [Vendas]
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
 *         description: Venda excluída com sucesso
 *       404:
 *         description: Venda não encontrada
 */
router.delete("/:id", authMiddleware, authorize("admin"), VendaController.delete)

module.exports = router
