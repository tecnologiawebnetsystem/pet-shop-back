const bcrypt = require("bcrypt")
const crypto = require("crypto")
const prisma = require("../config/database")
const AppError = require("../utils/AppError")
const generateToken = require("../utils/generateToken")
const { sendEmail } = require("../config/email")
const logger = require("../config/logger")

class AuthController {
  /**
   * Login de usuário
   */
  async login(req, res) {
    const { email, senha } = req.body

    // Buscar usuário pelo email
    const user = await prisma.usuario.findUnique({
      where: { email },
    })

    // Verificar se o usuário existe
    if (!user) {
      throw new AppError("Email ou senha incorretos", 401)
    }

    // Verificar se o usuário está ativo
    if (user.status === "inativo") {
      throw new AppError("Usuário inativo", 401)
    }

    // Verificar se a senha está correta
    const passwordMatch = await bcrypt.compare(senha, user.senha)
    if (!passwordMatch) {
      throw new AppError("Email ou senha incorretos", 401)
    }

    // Atualizar último acesso
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimo_acesso: new Date() },
    })

    // Gerar token JWT
    const token = generateToken({ id: user.id })

    // Retornar token e dados do usuário (sem a senha)
    const { senha: _, ...userData } = user

    return res.json({
      user: userData,
      token,
    })
  }

  /**
   * Solicitar redefinição de senha
   */
  async forgotPassword(req, res) {
    const { email } = req.body

    // Buscar usuário pelo email
    const user = await prisma.usuario.findUnique({
      where: { email },
    })

    // Verificar se o usuário existe
    if (!user) {
      throw new AppError("Email não encontrado", 404)
    }

    // Gerar token de redefinição de senha
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco de dados
    await prisma.resetSenhaToken.create({
      data: {
        usuario_id: user.id,
        token: resetToken,
        expira_em: resetTokenExpires,
      },
    })

    // Enviar email com link para redefinição de senha
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    const emailHtml = `
      <h1>Redefinição de Senha</h1>
      <p>Olá ${user.nome},</p>
      <p>Você solicitou a redefinição de senha. Clique no link abaixo para criar uma nova senha:</p>
      <a href="${resetUrl}" target="_blank">Redefinir Senha</a>
      <p>O link é válido por 1 hora.</p>
      <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
    `

    await sendEmail(user.email, "Redefinição de Senha", emailHtml)

    return res.json({
      message: "Email de redefinição de senha enviado com sucesso",
    })
  }

  /**
   * Redefinir senha
   */
  async resetPassword(req, res) {
    const { token, senha } = req.body

    // Buscar token no banco de dados
    const resetToken = await prisma.resetSenhaToken.findFirst({
      where: {
        token,
        expira_em: {
          gt: new Date(),
        },
        usado: false,
      },
    })

    // Verificar se o token é válido
    if (!resetToken) {
      throw new AppError("Token inválido ou expirado", 400)
    }

    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    // Atualizar senha do usuário
    await prisma.usuario.update({
      where: { id: resetToken.usuario_id },
      data: { senha: hashedPassword },
    })

    // Marcar token como usado
    await prisma.resetSenhaToken.update({
      where: { id: resetToken.id },
      data: { usado: true },
    })

    return res.json({
      message: "Senha redefinida com sucesso",
    })
  }
}

module.exports = new AuthController()
