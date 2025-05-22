const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class CategoriaProdutoController {
  /**
   * Listar todas as categorias de produto
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
      prisma.categoriaProduto.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.categoriaProduto.count({ where }),
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
   * Buscar categoria de produto por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const categoria = await prisma.categoriaProduto.findUnique({
      where: { id: Number(id) },
      include: {
        produtos: true,
      },
    })

    if (!categoria) {
      throw new AppError("Categoria de produto não encontrada", 404)
    }

    return res.json(categoria)
  }

  /**
   * Criar nova categoria de produto
   */
  async create(req, res) {
    const { nome, descricao } = req.body

    // Verificar se já existe uma categoria com o mesmo nome
    const categoriaExistente = await prisma.categoriaProduto.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: "insensitive",
        },
      },
    })

    if (categoriaExistente) {
      throw new AppError("Já existe uma categoria de produto com este nome", 409)
    }

    // Criar categoria
    const categoria = await prisma.categoriaProduto.create({
      data: {
        nome,
        descricao,
      },
    })

    return res.status(201).json(categoria)
  }

  /**
   * Atualizar categoria de produto
   */
  async update(req, res) {
    const { id } = req.params
    const { nome, descricao } = req.body

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaProduto.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de produto não encontrada", 404)
    }

    // Verificar se já existe outra categoria com o mesmo nome
    if (nome && nome !== categoria.nome) {
      const categoriaExistente = await prisma.categoriaProduto.findFirst({
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
        throw new AppError("Já existe uma categoria de produto com este nome", 409)
      }
    }

    // Atualizar categoria
    const categoriaAtualizada = await prisma.categoriaProduto.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
      },
    })

    return res.json(categoriaAtualizada)
  }

  /**
   * Excluir categoria de produto
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaProduto.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de produto não encontrada", 404)
    }

    // Verificar se existem produtos associados à categoria
    const produtosAssociados = await prisma.produto.count({
      where: { categoria_id: Number(id) },
    })

    if (produtosAssociados > 0) {
      throw new AppError("Não é possível excluir a categoria pois existem produtos associados a ela", 400)
    }

    // Excluir categoria
    await prisma.categoriaProduto.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar produtos da categoria
   */
  async findProdutos(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se a categoria existe
    const categoria = await prisma.categoriaProduto.findUnique({
      where: { id: Number(id) },
    })

    if (!categoria) {
      throw new AppError("Categoria de produto não encontrada", 404)
    }

    // Construir filtro
    const where = { categoria_id: Number(id) }
    if (status) where.status = status

    // Buscar produtos da categoria
    const produtos = await prisma.produto.findMany({
      where,
      orderBy: { nome: "asc" },
    })

    return res.json(produtos)
  }
}

module.exports = new CategoriaProdutoController()
