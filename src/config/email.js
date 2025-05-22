const nodemailer = require("nodemailer")
const logger = require("./logger")

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Verifica a conexão com o servidor de email
transporter.verify((error) => {
  if (error) {
    logger.error("Erro na configuração do servidor de email:", error)
  } else {
    logger.info("Servidor de email configurado com sucesso")
  }
})

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Petshop ERP" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    })

    logger.info(`Email enviado: ${info.messageId}`)
    return info
  } catch (error) {
    logger.error("Erro ao enviar email:", error)
    throw error
  }
}

module.exports = {
  sendEmail,
}
