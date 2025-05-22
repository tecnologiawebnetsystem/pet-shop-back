require("dotenv").config()
require("express-async-errors")
const app = require("./app")
const logger = require("./config/logger")

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT} em ambiente ${process.env.NODE_ENV}`)
})
