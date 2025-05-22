const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class CategoriaServicoController {
  /**
   * Listar todas as categorias de serviço
   */
  async findAll(req, res) {
    const { nome, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (nome) {
      where.nome = {
        contains: nome,
      }
    }

    // Buscar categorias com paginação
    const [categorias, total] = await Promise.all([
      prisma.categoriaServico.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.categoriaServico.count({ where }),
    ])

    return res.json({
      categorias,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar categoria de serviço por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const categoria = await prisma.categoriaServico.findUnique({
      where: { id: Number(id) },
      include: {
        servicos: true,
      },
    })

    if (!categoria) {
      throw new AppError("Categoria de serviço não encontrada", 404)
    }

    return res.json(categoria)
  }

  /**
   * Criar nova categoria de serviço
   */
  async create(req, res) {
    const { nome, descricao } = req.body

    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExistente = await prisma.categoriaServico.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
      },
    })

    if (categoriaExistente) {
      throw new AppError("Já existe uma categoria de serviço com este nome", 409)
    }

    // Criar categoria
    const categoria = await prisma.categoriaServico.create({
      data: {
        nome,
        descricao,
      },
    })

    return res.status(201).json(categoria)
  }

  /**
   * Atualizar categoria de serviço
   */
  async update(req, res) {
    const { id } = req.params
    const { nome, descricao } = req.body

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaServico.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de serviço não encontrada", 404)
    }

    // Verificar se já existe outra categoria com o mesmo nome
    if (nome && nome !== categoria.nome) {
      const categoriaExistente = await prisma.categoriaServico.findFirst({
        where: {
          nome: {
            equals: nome,
            mode: "insensitive",
          },
          id: {
            not: Number(id),
          },
        },
      })

      if (categoriaExistente) {
        throw new AppError("Já existe uma categoria de serviço com este nome", 409)
      }
    }

    // Atualizar categoria
    const categoriaAtualizada = await prisma.categoriaServico.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
      },
    })

    return res.json(categoriaAtualizada)
  }

  /**
   * Excluir categoria de serviço
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaServico.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de serviço não encontrada", 404)
    }

    // Verificar se existem serviços associados à categoria
    const servicosAssociados = await prisma.servico.count({
      where: { categoria_id: Number(id) },
    })

    if (servicosAssociados > 0) {
      throw new AppError("Não é possível excluir a categoria pois existem serviços associados a ela", 400)
    }

    // Excluir categoria
    await prisma.categoriaServico.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar serviços da categoria
   */
  async findServicos(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaServico.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de serviço não encontrada", 404)
    }

    // Construir filtro
    const where = { categoria_id: Number(id) }
    if (status) where.status = status

    // Buscar serviços da categoria
    const servicos = await prisma.servico.findMany({
      where,
      orderBy: { nome: "asc" },
    })

    return res.json(servicos)
  }
}

module.exports = new CategoriaServicoController()
