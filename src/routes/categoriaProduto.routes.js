const express = require("express")
const CategoriaProdutoController = require("../controllers/CategoriaProdutoController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const {
  createCategoriaProdutoSchema,
  updateCategoriaProdutoSchema,
} = require("../validations/categoriaProduto.validation")

const router = express.Router()

/**
 * @swagger
 * /categorias-produto:
 *   get:
 *     summary: Listar todas as categorias de produto
 *     tags: [Categorias de Produto]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
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
 *         description: Lista de categorias de produto
 */
router.get("/", authMiddleware, CategoriaProdutoController.findAll)

/**
 * @swagger
 * /categorias-produto/{id}:
 *   get:
 *     summary: Obter categoria de produto por ID
 *     tags: [Categorias de Produto]
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
 *         description: Detalhes da categoria de produto
 *       404:
 *         description: Categoria de produto não encontrada
 */
router.get("/:id", authMiddleware, CategoriaProdutoController.findById)

/**
 * @swagger
 * /categorias-produto:
 *   post:
 *     summary: Criar nova categoria de produto
 *     tags: [Categorias de Produto]
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
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoria de produto criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createCategoriaProdutoSchema),
  CategoriaProdutoController.create,
)

/**
 * @swagger
 * /categorias-produto/{id}:
 *   put:
 *     summary: Atualizar categoria de produto
 *     tags: [Categorias de Produto]
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
 *     responses:
 *       200:
 *         description: Categoria de produto atualizada com sucesso
 *       404:
 *         description: Categoria de produto não encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateCategoriaProdutoSchema),
  CategoriaProdutoController.update,
)

/**
 * @swagger
 * /categorias-produto/{id}:
 *   delete:
 *     summary: Excluir categoria de produto
 *     tags: [Categorias de Produto]
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
 *         description: Categoria de produto excluída com sucesso
 *       404:
 *         description: Categoria de produto não encontrada
 */
router.delete("/:id", authMiddleware, authorize("admin"), CategoriaProdutoController.delete)

/**
 * @swagger
 * /categorias-produto/{id}/produtos:
 *   get:
 *     summary: Listar produtos da categoria
 *     tags: [Categorias de Produto]
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
 *         description: Lista de produtos da categoria
 *       404:
 *         description: Categoria de produto não encontrada
 */
router.get("/:id/produtos", authMiddleware, CategoriaProdutoController.findProdutos)

module.exports = router
