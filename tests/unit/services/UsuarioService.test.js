const bcrypt = require("bcrypt")
const UsuarioService = require("../../../src/services/UsuarioService")
const prisma = require("../../../src/config/database")
const AppError = require("../../../src/utils/AppError")

// Mock do Prisma
jest.mock("../../../src/config/database", () => ({
  usuario: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

// Mock do bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(() => "hashed_password"),
  compare: jest.fn(),
}))

describe("UsuarioService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("findAll", () => {
    it("deve retornar lista de usuários com paginação", async () => {
      const mockUsuarios = [
        { id: 1, nome: "Usuário 1" },
        { id: 2, nome: "Usuário 2" },
      ]

      prisma.usuario.findMany.mockResolvedValue(mockUsuarios)
      prisma.usuario.count.mockResolvedValue(2)

      const result = await UsuarioService.findAll({}, { page: 1, limit: 10 })

      expect(result).toHaveProperty("usuarios", mockUsuarios)
      expect(result).toHaveProperty("pagination")
      expect(result.pagination).toHaveProperty("total", 2)
      expect(prisma.usuario.findMany).toHaveBeenCalled()
      expect(prisma.usuario.count).toHaveBeenCalled()
    })
  })

  describe("findById", () => {
    it("deve retornar usuário por ID", async () => {
      const mockUsuario = { id: 1, nome: "Usuário Teste" }
      prisma.usuario.findUnique.mockResolvedValue(mockUsuario)

      const result = await UsuarioService.findById(1)

      expect(result).toEqual(mockUsuario)
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.any(Object),
      })
    })

    it("deve lançar erro se usuário não for encontrado", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null)

      await expect(UsuarioService.findById(999)).rejects.toThrow(AppError)
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: expect.any(Object),
      })
    })
  })

  describe("create", () => {
    it("deve criar um novo usuário", async () => {
      const userData = {
        nome: "Novo Usuário",
        email: "novo@teste.com",
        senha: "senha123",
        tipo: "cliente",
      }

      const mockCreatedUser = {
        id: 1,
        nome: userData.nome,
        email: userData.email,
        tipo: userData.tipo,
      }

      prisma.usuario.findUnique.mockResolvedValue(null)
      prisma.usuario.create.mockResolvedValue(mockCreatedUser)

      const result = await UsuarioService.create(userData)

      expect(result).toEqual(mockCreatedUser)
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.senha, 10)
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nome: userData.nome,
          email: userData.email,
          senha: "hashed_password",
        }),
        select: expect.any(Object),
      })
    })

    it("deve lançar erro se email já estiver em uso", async () => {
      const userData = {
        nome: "Novo Usuário",
        email: "existente@teste.com",
        senha: "senha123",
        tipo: "cliente",
      }

      prisma.usuario.findUnique.mockResolvedValue({ id: 2, email: userData.email })

      await expect(UsuarioService.create(userData)).rejects.toThrow(AppError)
      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      })
      expect(prisma.usuario.create).not.toHaveBeenCalled()
    })
  })

  describe("update", () => {
    it("deve atualizar um usuário existente", async () => {
      const userId = 1
      const updateData = {
        nome: "Nome Atualizado",
        telefone: "11999999999",
      }

      const mockUsuario = {
        id: userId,
        nome: "Nome Antigo",
        email: "usuario@teste.com",
      }

      const mockUpdatedUsuario = {
        ...mockUsuario,
        nome: updateData.nome,
        telefone: updateData.telefone,
      }

      prisma.usuario.findUnique.mockResolvedValue(mockUsuario)
      prisma.usuario.update.mockResolvedValue(mockUpdatedUsuario)

      const currentUser = { id: userId, tipo: "cliente" }
      const result = await UsuarioService.update(userId, updateData, currentUser)

      expect(result).toEqual(mockUpdatedUsuario)
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining(updateData),
        select: expect.any(Object),
      })
    })

    it("deve lançar erro se usuário não for encontrado", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null)

      const currentUser = { id: 1, tipo: "admin" }
      await expect(UsuarioService.update(999, { nome: "Teste" }, currentUser)).rejects.toThrow(AppError)
    })

    it("deve verificar email duplicado ao atualizar", async () => {
      const userId = 1
      const updateData = {
        email: "existente@teste.com",
      }

      const mockUsuario = {
        id: userId,
        nome: "Usuário",
        email: "original@teste.com",
      }

      prisma.usuario.findUnique
        .mockResolvedValueOnce(mockUsuario) // Primeira chamada para verificar se o usuário existe
        .mockResolvedValueOnce({ id: 2, email: updateData.email }) // Segunda chamada para verificar email duplicado

      const currentUser = { id: userId, tipo: "cliente" }
      await expect(UsuarioService.update(userId, updateData, currentUser)).rejects.toThrow(AppError)
    })
  })

  describe("delete", () => {
    it("deve excluir um usuário existente", async () => {
      const userId = 1
      const mockUsuario = { id: userId, nome: "Usuário para Excluir" }

      prisma.usuario.findUnique.mockResolvedValue(mockUsuario)
      prisma.usuario.delete.mockResolvedValue(mockUsuario)

      await UsuarioService.delete(userId)

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      })
      expect(prisma.usuario.delete).toHaveBeenCalledWith({
        where: { id: userId },
      })
    })

    it("deve lançar erro se usuário não for encontrado", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null)

      await expect(UsuarioService.delete(999)).rejects.toThrow(AppError)
      expect(prisma.usuario.delete).not.toHaveBeenCalled()
    })
  })

  describe("changePassword", () => {
    it("deve alterar a senha do usuário", async () => {
      const userId = 1
      const passwordData = {
        senhaAtual: "senha_atual",
        novaSenha: "nova_senha",
      }

      const mockUsuario = {
        id: userId,
        senha: "hashed_current_password",
      }

      prisma.usuario.findUnique.mockResolvedValue(mockUsuario)
      bcrypt.compare.mockResolvedValue(true)
      prisma.usuario.update.mockResolvedValue({ id: userId })

      const currentUser = { id: userId, tipo: "cliente" }
      const result = await UsuarioService.changePassword(userId, passwordData, currentUser)

      expect(result).toHaveProperty("message", "Senha alterada com sucesso")
      expect(bcrypt.compare).toHaveBeenCalledWith(passwordData.senhaAtual, mockUsuario.senha)
      expect(bcrypt.hash).toHaveBeenCalledWith(passwordData.novaSenha, 10)
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { senha: "hashed_password" },
      })
    })

    it("deve lançar erro se a senha atual estiver incorreta", async () => {
      const userId = 1
      const passwordData = {
        senhaAtual: "senha_errada",
        novaSenha: "nova_senha",
      }

      const mockUsuario = {
        id: userId,
        senha: "hashed_current_password",
      }

      prisma.usuario.findUnique.mockResolvedValue(mockUsuario)
      bcrypt.compare.mockResolvedValue(false)

      const currentUser = { id: userId, tipo: "cliente" }
      await expect(UsuarioService.changePassword(userId, passwordData, currentUser)).rejects.toThrow(AppError)
      expect(prisma.usuario.update).not.toHaveBeenCalled()
    })
  })
})
