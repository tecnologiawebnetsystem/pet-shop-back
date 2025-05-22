const express = require("express")
const CategoriaServicoController = require("../controllers/CategoriaServicoController")
const { authMiddleware, authorize } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const {
  createCategoriaServicoSchema,
  updateCategoriaServicoSchema,
} = require("../validations/categoriaServico.validation")

const router = express.Router()

/**
 * @swagger
 * /categorias-servico:
 *   get:
 *     summary: Listar todas as categorias de serviço
 *     tags: [Categorias de Serviço]
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
 *         description: Lista de categorias de serviço
 */
router.get("/", authMiddleware, CategoriaServicoController.findAll)

/**
 * @swagger
 * /categorias-servico/{id}:
 *   get:
 *     summary: Obter categoria de serviço por ID
 *     tags: [Categorias de Serviço]
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
 *         description: Detalhes da categoria de serviço
 *       404:
 *         description: Categoria de serviço não encontrada
 */
router.get("/:id", authMiddleware, CategoriaServicoController.findById)

/**
 * @swagger
 * /categorias-servico:
 *   post:
 *     summary: Criar nova categoria de serviço
 *     tags: [Categorias de Serviço]
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
 *         description: Categoria de serviço criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post(
  "/",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(createCategoriaServicoSchema),
  CategoriaServicoController.create,
)

/**
 * @swagger
 * /categorias-servico/{id}:
 *   put:
 *     summary: Atualizar categoria de serviço
 *     tags: [Categorias de Serviço]
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
 *         description: Categoria de serviço atualizada com sucesso
 *       404:
 *         description: Categoria de serviço não encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "funcionario"),
  validate(updateCategoriaServicoSchema),
  CategoriaServicoController.update,
)

/**
 * @swagger
 * /categorias-servico/{id}:
 *   delete:
 *     summary: Excluir categoria de serviço
 *     tags: [Categorias de Serviço]
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
 *         description: Categoria de serviço excluída com sucesso
 *       404:
 *         description: Categoria de serviço não encontrada
 */
router.delete("/:id", authMiddleware, authorize("admin"), CategoriaServicoController.delete)

/**
 * @swagger
 * /categorias-servico/{id}/servicos:
 *   get:
 *     summary: Listar serviços da categoria
 *     tags: [Categorias de Serviço]
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
 *         description: Lista de serviços da categoria
 *       404:
 *         description: Categoria de serviço não encontrada
 */
router.get("/:id/servicos", authMiddleware, CategoriaServicoController.findServicos)

module.exports = router
