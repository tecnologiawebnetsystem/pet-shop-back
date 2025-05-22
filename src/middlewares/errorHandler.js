const AppError = require("../utils/AppError")
const logger = require("../config/logger")

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack })

  // Erros do Prisma
  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Já existe um registro com este valor único",
        code: "CONFLICT",
      })
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Registro não encontrado",
        code: "NOT_FOUND",
      })
    }
  }

  // Erros de validação do Joi
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: err.message,
      code: "VALIDATION_ERROR",
      details: err.details,
    })
  }

  // Erros personalizados da aplicação
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.code,
    })
  }

  // Erros do Multer
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "Arquivo muito grande",
        code: "FILE_TOO_LARGE",
      })
    }
  }

  // Erros do JWT
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token inválido ou expirado",
      code: "INVALID_TOKEN",
    })
  }

  // Erro padrão para produção
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({
      status: "error",
      message: "Erro interno do servidor",
      code: "INTERNAL_SERVER_ERROR",
    })
  }

  // Erro detalhado para desenvolvimento
  return res.status(500).json({
    status: "error",
    message: err.message,
    stack: err.stack,
    code: "INTERNAL_SERVER_ERROR",
  })
}

module.exports = errorHandler
