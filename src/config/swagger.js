const swaggerJsdoc = require("swagger-jsdoc")

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API do ERP de Petshop",
      version: "1.0.0",
      description: "Documentação da API do sistema ERP para gerenciamento de Petshop",
      contact: {
        name: "Suporte",
        email: "suporte@petshop.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desenvolvimento",
      },
      {
        url: "https://api.petshop.com/api",
        description: "Servidor de produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
