const prisma = require("../config/database")

class UsuarioRepository {
  /**
   * Buscar todos os usuários com filtros e paginação
   */
  async findAll(where = {}, { skip, take, orderBy = { nome: "asc" } } = {}) {
    return prisma.usuario.findMany({
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
      take,
      orderBy,
    })
  }

  /**
   * Contar total de usuários com filtros
   */
  async count(where = {}) {
    return prisma.usuario.count({ where })
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    return prisma.usuario.findUnique({
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
  }

  /**
   * Buscar usuário por email
   */
  async findByEmail(email) {
    return prisma.usuario.findUnique({
      where: { email },
    })
  }

  /**
   * Criar novo usuário
   */
  async create(data) {
    return prisma.usuario.create({
      data,
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
  }

  /**
   * Atualizar usuário
   */
  async update(id, data) {
    return prisma.usuario.update({
      where: { id: Number(id) },
      data,
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
  }

  /**
   * Excluir usuário
   */
  async delete(id) {
    return prisma.usuario.delete({
      where: { id: Number(id) },
    })
  }
}

module.exports = new UsuarioRepository()
