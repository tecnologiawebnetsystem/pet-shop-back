const bcrypt = require("bcrypt")
const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class UsuarioService {
  /**
   * Buscar todos os usuários com filtros e paginação
   */
  async findAll(filters = {}, pagination = {}) {
    const { tipo, status } = filters
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}
    if (tipo) where.tipo = tipo
    if (status) where.status = status

    // Buscar usuários com paginação
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          tipo: true,
          data_cadastro: true,
          ultimo_acesso: true,
          status: true,
        },
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.usuario.count({ where }),
    ])

    return {
      usuarios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        data_cadastro: true,
        ultimo_acesso: true,
        status: true,
      },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    return usuario
  }

  /**
   * Criar novo usuário
   */
  async create(data) {
    const { nome, email, senha, telefone, tipo, status = "ativo" } = data

    // Verificar se o email já está em uso
    const emailExists = await prisma.usuario.findUnique({
      where: { email },
    })

    if (emailExists) {
      throw new AppError("Email já está em uso", 409)
    }

    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10)

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        telefone,
        tipo,
        status,
        data_cadastro: new Date(),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        data_cadastro: true,
        status: true,
      },
    })

    return usuario
  }

  /**
   * Atualizar usuário
   */
  async update(id, data, currentUser) {
    const { nome, email, telefone, status } = data

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== usuario.email) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email },
      })

      if (emailExists) {
        throw new AppError("Email já está em uso", 409)
      }
    }

    // Construir objeto de atualização
    const updateData = {}
    if (nome) updateData.nome = nome
    if (email) updateData.email = email
    if (telefone !== undefined) updateData.telefone = telefone

    // Apenas admin pode alterar o status
    if (status && currentUser.tipo === "admin") {
      updateData.status = status
    }

    // Atualizar usuário
    const updatedUsuario = await prisma.usuario.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        tipo: true,
        data_cadastro: true,
        ultimo_acesso: true,
        status: true,
      },
    })

    return updatedUsuario
  }

  /**
   * Excluir usuário
   */
  async delete(id) {
    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Excluir usuário
    await prisma.usuario.delete({
      where: { id: Number(id) },
    })
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(id, { senhaAtual, novaSenha }, currentUser) {
    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Verificar se a senha atual está correta
    const passwordMatch = await bcrypt.compare(senhaAtual, usuario.senha)
    if (!passwordMatch) {
      throw new AppError("Senha atual incorreta", 400)
    }

    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10)

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: { senha: hashedPassword },
    })

    return { message: "Senha alterada com sucesso" }
  }
}

module.exports = new UsuarioService()
