const express = require("express")
const AuthController = require("../controllers/AuthController")
const validate = require("../middlewares/validate")
const { loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validations/auth.validation")

const router = express.Router()

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticar usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", validate(loginSchema), AuthController.login)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar redefinição de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email de redefinição enviado
 *       404:
 *         description: Email não encontrado
 */
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefinir senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - senha
 *             properties:
 *               token:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword)

module.exports = router
