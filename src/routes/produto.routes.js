const express = require("express")
const ProdutoController = require("../controllers/ProdutoController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createProdutoSchema, updateProdutoSchema, updateEstoqueSchema } = require("../validations/produto.validation")
const { productUpload } = require("../config/multer")

const router = express.Router()

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Produtos]
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
 *         name: fornecedor_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: codigo_barras
 *         schema:
 *           type: string
 *       - in: query
 *         name: estoque_minimo
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
 *         description: Lista de produtos
 */
router.get("/", authMiddleware, ProdutoController.findAll)

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags: [Produtos]
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
 *         description: Detalhes do produto
 *       404:
 *         description: Produto não encontrado
 */
router.get("/:id", authMiddleware, ProdutoController.findById)

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Criar novo produto
 *     tags: [Produtos]
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
 *               preco_custo:
 *                 type: number
 *               estoque:
 *                 type: integer
 *               estoque_minimo:
 *                 type: integer
 *               categoria_id:
 *                 type: integer
 *               fornecedor_id:
 *                 type: integer
 *               codigo_barras:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createProdutoSchema),
  ProdutoController.create,
)

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Produtos]
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
 *               preco_custo:
 *                 type: number
 *               estoque:
 *                 type: integer
 *               estoque_minimo:
 *                 type: integer
 *               categoria_id:
 *                 type: integer
 *               fornecedor_id:
 *                 type: integer
 *               codigo_barras:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, inativo]
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateProdutoSchema),
  ProdutoController.update,
)

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Excluir produto
 *     tags: [Produtos]
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
 *         description: Produto excluído com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.delete("/:id", authMiddleware, authorize("admin"), ProdutoController.delete)

/**
 * @swagger
 * /produtos/{id}/imagem:
 *   post:
 *     summary: Upload de imagem do produto
 *     tags: [Produtos]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem atualizada com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.post(
  "/:id/imagem",
  authMiddleware,
  authorize("admin", "funcionario"),
  productUpload.single("file"),
  ProdutoController.uploadImagem,
)

/**
 * @swagger
 * /produtos/{id}/estoque:
 *   post:
 *     summary: Atualizar estoque do produto
 *     tags: [Produtos]
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
 *             required:
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: integer
 *               operacao:
 *                 type: string
 *                 enum: [adicionar, remover]
 *                 default: adicionar
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.post(
  "/:id/estoque",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateEstoqueSchema),
  ProdutoController.updateEstoque,
)

module.exports = router
