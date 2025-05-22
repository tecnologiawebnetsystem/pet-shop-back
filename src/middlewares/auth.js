const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const prisma = require("../config/database")

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o token está presente no header
    const authHeader = req.headers.authorization
    if (!authHeader) {
      throw new AppError("Token não fornecido", 401)
    }

    // Extrair o token do header
    const [scheme, token] = authHeader.split(" ")
    if (!/^Bearer$/i.test(scheme)) {
      throw new AppError("Formato de token inválido", 401)
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verificar se o usuário existe e está ativo
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      throw new AppError("Usuário não encontrado", 401)
    }

    if (user.status === "inativo") {
      throw new AppError("Usuário inativo", 401)
    }

    // Atualizar último acesso
    await prisma.usuario.update({
      where: { id: user.id },
      data: { ultimo_acesso: new Date() },
    })

    // Adicionar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
    }

    return next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Token inválido", 401))
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expirado", 401))
    }
    return next(error)
  }
}

// Middleware para verificar permissões
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Não autorizado", 401))
    }

    if (!allowedRoles.includes(req.user.tipo)) {
      return next(new AppError("Acesso negado", 403))
    }

    return next()
  }
}

module.exports = {
  authMiddleware,
  authorize,
}
