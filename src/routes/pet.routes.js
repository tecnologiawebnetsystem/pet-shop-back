const express = require("express")
const PetController = require("../controllers/PetController")
const { authMiddleware } = require("../middlewares/auth")
const validate = require("../middlewares/validate")
const { createPetSchema, updatePetSchema } = require("../validations/pet.validation")
const { petUpload } = require("../config/multer")

const router = express.Router()

/**
 * @swagger
 * /pets:
 *   get:
 *     summary: Listar todos os pets
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *       - in: query
 *         name: especie
 *         schema:
 *           type: string
 *       - in: query
 *         name: raca
 *         schema:
 *           type: string
 *       - in: query
 *         name: cliente_id
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
 *         description: Lista de pets
 */
router.get("/", authMiddleware, PetController.findAll)

/**
 * @swagger
 * /pets/{id}:
 *   get:
 *     summary: Obter pet por ID
 *     tags: [Pets]
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
 *         description: Detalhes do pet
 *       404:
 *         description: Pet não encontrado
 */
router.get("/:id", authMiddleware, PetController.findById)

/**
 * @swagger
 * /pets:
 *   post:
 *     summary: Criar novo pet
 *     tags: [Pets]
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
 *               - nome
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               especie:
 *                 type: string
 *               raca:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               peso:
 *                 type: number
 *               sexo:
 *                 type: string
 *                 enum: [macho, femea]
 *               cor:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pet criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/", authMiddleware, validate(createPetSchema), PetController.create)

/**
 * @swagger
 * /pets/{id}:
 *   put:
 *     summary: Atualizar pet
 *     tags: [Pets]
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
 *               cliente_id:
 *                 type: integer
 *               nome:
 *                 type: string
 *               especie:
 *                 type: string
 *               raca:
 *                 type: string
 *               data_nascimento:
 *                 type: string
 *                 format: date
 *               peso:
 *                 type: number
 *               sexo:
 *                 type: string
 *                 enum: [macho, femea]
 *               cor:
 *                 type: string
 *               observacoes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pet atualizado com sucesso
 *       404:
 *         description: Pet não encontrado
 */
router.put("/:id", authMiddleware, validate(updatePetSchema), PetController.update)

/**
 * @swagger
 * /pets/{id}:
 *   delete:
 *     summary: Excluir pet
 *     tags: [Pets]
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
 *         description: Pet excluído com sucesso
 *       404:
 *         description: Pet não encontrado
 */
router.delete("/:id", authMiddleware, PetController.delete)

/**
 * @swagger
 * /pets/{id}/foto:
 *   post:
 *     summary: Upload de foto do pet
 *     tags: [Pets]
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
 *         description: Foto atualizada com sucesso
 *       404:
 *         description: Pet não encontrado
 */
router.post("/:id/foto", authMiddleware, petUpload.single("file"), PetController.uploadFoto)

/**
 * @swagger
 * /pets/{id}/agendamentos:
 *   get:
 *     summary: Listar agendamentos do pet
 *     tags: [Pets]
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
 *         description: Lista de agendamentos do pet
 *       404:
 *         description: Pet não encontrado
 */
router.get("/:id/agendamentos", authMiddleware, PetController.findAgendamentos)

module.exports = router
