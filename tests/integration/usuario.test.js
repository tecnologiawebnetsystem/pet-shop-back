const request = require("supertest")
const app = require("../../src/app")
const prisma = require("../../src/config/database")
const generateToken = require("../../src/utils/generateToken")

describe("Usuário API", () => {
  let adminToken
  let clienteToken
  let adminUser
  let clienteUser

  // Configuração antes de todos os testes
  beforeAll(async () => {
    // Limpar banco de dados de teste
    await prisma.usuario.deleteMany()

    // Criar usuário admin para testes
    adminUser = await prisma.usuario.create({
      data: {
        nome: "Admin Teste",
        email: "admin@teste.com",
        senha: "$2b$10$7JrAQ.aSLETBEIi1SssyQOQmZpAJ./jEVkwHHbUcRjr3XZmzNpTwW", // senha123
        tipo: "admin",
        status: "ativo",
        data_cadastro: new Date(),
      },
    })

    // Criar usuário cliente para testes
    clienteUser = await prisma.usuario.create({
      data: {
        nome: "Cliente Teste",
        email: "cliente@teste.com",
        senha: "$2b$10$7JrAQ.aSLETBEIi1SssyQOQmZpAJ./jEVkwHHbUcRjr3XZmzNpTwW", // senha123
        tipo: "cliente",
        status: "ativo",
        data_cadastro: new Date(),
      },
    })

    // Gerar tokens
    adminToken = generateToken({ id: adminUser.id })
    clienteToken = generateToken({ id: clienteUser.id })
  })

  // Limpeza após todos os testes
  afterAll(async () => {
    await prisma.usuario.deleteMany()
    await prisma.$disconnect()
  })

  describe("GET /api/usuarios", () => {
    it("deve retornar lista de usuários para admin", async () => {
      const response = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("usuarios")
      expect(response.body).toHaveProperty("pagination")
      expect(Array.isArray(response.body.usuarios)).toBe(true)
    })

    it("deve negar acesso para usuário não admin", async () => {
      const response = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${clienteToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe("GET /api/usuarios/:id", () => {
    it("deve retornar detalhes do próprio usuário", async () => {
      const response = await request(app)
        .get(`/api/usuarios/${clienteUser.id}`)
        .set("Authorization", `Bearer ${clienteToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("id", clienteUser.id)
      expect(response.body).toHaveProperty("email", clienteUser.email)
    })

    it("admin deve poder acessar detalhes de qualquer usuário", async () => {
      const response = await request(app)
        .get(`/api/usuarios/${clienteUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("id", clienteUser.id)
    })

    it("deve negar acesso aos detalhes de outro usuário", async () => {
      const response = await request(app)
        .get(`/api/usuarios/${adminUser.id}`)
        .set("Authorization", `Bearer ${clienteToken}`)

      expect(response.status).toBe(403)
    })
  })

  describe("POST /api/usuarios", () => {
    it("admin deve poder criar novo usuário", async () => {
      const novoUsuario = {
        nome: "Novo Usuário",
        email: "novo@teste.com",
        senha: "senha123",
        tipo: "funcionario",
      }

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(novoUsuario)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty("id")
      expect(response.body).toHaveProperty("email", novoUsuario.email)
      expect(response.body).toHaveProperty("tipo", novoUsuario.tipo)

      // Limpar usuário criado
      await prisma.usuario.delete({
        where: { email: novoUsuario.email },
      })
    })

    it("deve negar criação de usuário para não admin", async () => {
      const novoUsuario = {
        nome: "Outro Usuário",
        email: "outro@teste.com",
        senha: "senha123",
        tipo: "cliente",
      }

      const response = await request(app)
        .post("/api/usuarios")
        .set("Authorization", `Bearer ${clienteToken}`)
        .send(novoUsuario)

      expect(response.status).toBe(403)
    })
  })

  describe("PUT /api/usuarios/:id", () => {
    it("usuário deve poder atualizar seus próprios dados", async () => {
      const dadosAtualizados = {
        nome: "Cliente Atualizado",
        telefone: "11999999999",
      }

      const response = await request(app)
        .put(`/api/usuarios/${clienteUser.id}`)
        .set("Authorization", `Bearer ${clienteToken}`)
        .send(dadosAtualizados)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("nome", dadosAtualizados.nome)
      expect(response.body).toHaveProperty("telefone", dadosAtualizados.telefone)
    })

    it("admin deve poder atualizar qualquer usuário", async () => {
      const dadosAtualizados = {
        nome: "Cliente Modificado",
        status: "inativo",
      }

      const response = await request(app)
        .put(`/api/usuarios/${clienteUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(dadosAtualizados)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("nome", dadosAtualizados.nome)
      expect(response.body).toHaveProperty("status", dadosAtualizados.status)
    })

    it("deve negar atualização de outro usuário", async () => {
      const dadosAtualizados = {
        nome: "Tentativa Hack",
      }

      const response = await request(app)
        .put(`/api/usuarios/${adminUser.id}`)
        .set("Authorization", `Bearer ${clienteToken}`)
        .send(dadosAtualizados)

      expect(response.status).toBe(403)
    })
  })

  describe("DELETE /api/usuarios/:id", () => {
    it("admin deve poder excluir usuário", async () => {
      // Criar usuário para excluir
      const usuarioParaExcluir = await prisma.usuario.create({
        data: {
          nome: "Usuário para Excluir",
          email: "excluir@teste.com",
          senha: "$2b$10$7JrAQ.aSLETBEIi1SssyQOQmZpAJ./jEVkwHHbUcRjr3XZmzNpTwW",
          tipo: "cliente",
          status: "ativo",
          data_cadastro: new Date(),
        },
      })

      const response = await request(app)
        .delete(`/api/usuarios/${usuarioParaExcluir.id}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(response.status).toBe(204)

      // Verificar se foi excluído
      const usuarioExcluido = await prisma.usuario.findUnique({
        where: { id: usuarioParaExcluir.id },
      })
      expect(usuarioExcluido).toBeNull()
    })

    it("deve negar exclusão para não admin", async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${adminUser.id}`)
        .set("Authorization", `Bearer ${clienteToken}`)

      expect(response.status).toBe(403)
    })
  })
})
