const bcrypt = require("bcrypt")
const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class UsuarioController {
  /**
   * Listar todos os usuários
   */
  async findAll(req, res) {
    const { tipo, status, page = 1, limit = 10 } = req.query
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

    return res.json({
      usuarios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar usuário por ID
   */
  async findById(req, res) {
    const { id } = req.params

    // Verificar se o usuário tem permissão para acessar os dados
    if (req.user.tipo !== "admin" && req.user.id !== Number(id)) {
      throw new AppError("Acesso negado", 403)
    }

    // Buscar usuário
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

    return res.json(usuario)
  }

  /**
   * Criar novo usuário
   */
  async create(req, res) {
    const { nome, email, senha, telefone, tipo, status = "ativo" } = req.body

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

    return res.status(201).json(usuario)
  }

  /**
   * Atualizar usuário
   */
  async update(req, res) {
    const { id } = req.params
    const { nome, email, telefone, status } = req.body

    // Verificar se o usuário tem permissão para atualizar os dados
    if (req.user.tipo !== "admin" && req.user.id !== Number(id)) {
      throw new AppError("Acesso negado", 403)
    }

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
    if (status && req.user.tipo === "admin") {
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

    return res.json(updatedUsuario)
  }

  /**
   * Excluir usuário
   */
  async delete(req, res) {
    const { id } = req.params

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

    return res.status(204).send()
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(req, res) {
    const { id } = req.params
    const { senhaAtual, novaSenha } = req.body

    // Verificar se o usuário tem permissão para alterar a senha
    if (req.user.tipo !== "admin" && req.user.id !== Number(id)) {
      throw new AppError("Acesso negado", 403)
    }

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

    return res.json({
      message: "Senha alterada com sucesso",
    })
  }
}

module.exports = new UsuarioController()
