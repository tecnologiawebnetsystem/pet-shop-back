const express = require("express")
const FornecedorController = require("../controllers/FornecedorController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createFornecedorSchema, updateFornecedorSchema } = require("../validations/fornecedor.validation")

const router = express.Router()

/**
 * @swagger
 * /fornecedores:
 *   get:
 *     summary: Listar todos os fornecedores
 *     tags: [Fornecedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: cnpj
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
 *         description: Lista de fornecedores
 */
router.get("/", authMiddleware, FornecedorController.findAll)

/**
 * @swagger
 * /fornecedores/{id}:
 *   get:
 *     summary: Obter fornecedor por ID
 *     tags: [Fornecedores]
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
 *         description: Detalhes do fornecedor
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get("/:id", authMiddleware, FornecedorController.findById)

/**
 * @swagger
 * /fornecedores:
 *   post:
 *     summary: Criar novo fornecedor
 *     tags: [Fornecedores]
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
 *             properties:
 *               nome:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               contato:
 *                 type: string
 *     responses:
 *       201:
 *         description: Fornecedor criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createFornecedorSchema),
  FornecedorController.create,
)

/**
 * @swagger
 * /fornecedores/{id}:
 *   put:
 *     summary: Atualizar fornecedor
 *     tags: [Fornecedores]
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
 *               cnpj:
 *                 type: string
 *               telefone:
 *                 type: string
 *               email:
 *                 type: string
 *               endereco:
 *                 type: string
 *               cidade:
 *                 type: string
 *               estado:
 *                 type: string
 *               cep:
 *                 type: string
 *               contato:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fornecedor atualizado com sucesso
 *       404:
 *         description: Fornecedor não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateFornecedorSchema),
  FornecedorController.update,
)

/**
 * @swagger
 * /fornecedores/{id}:
 *   delete:
 *     summary: Excluir fornecedor
 *     tags: [Fornecedores]
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
 *         description: Fornecedor excluído com sucesso
 *       404:
 *         description: Fornecedor não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin"), FornecedorController.delete)

/**
 * @swagger
 * /fornecedores/{id}/produtos:
 *   get:
 *     summary: Listar produtos do fornecedor
 *     tags: [Fornecedores]
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
 *           enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Lista de produtos do fornecedor
 *       404:
 *         description: Fornecedor não encontrado
 */
router.get("/:id/produtos", authMiddleware, FornecedorController.findProdutos)

module.exports = router
