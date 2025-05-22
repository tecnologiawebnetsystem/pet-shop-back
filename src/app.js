const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const swaggerUi = require("swagger-ui-express")
const swaggerSpec = require("./config/swagger")
const errorHandler = require("./middlewares/errorHandler")
const routes = require("./routes")

const app = express()

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan("dev"))

// Documentação Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rotas
app.use("/api", routes)

// Rota de verificação de saúde
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() })
})

// Middleware de tratamento de erros
app.use(errorHandler)

module.exports = app
