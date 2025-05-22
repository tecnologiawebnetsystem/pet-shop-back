const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class FornecedorController {
  /**
   * Listar todos os fornecedores
   */
  async findAll(req, res) {
    const { nome, cnpj, cidade, estado, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (nome) {
      where.nome = {
        contains: nome,
      }
    }

    if (cnpj) {
      where.cnpj = {
        contains: cnpj,
      }
    }

    if (cidade) {
      where.cidade = {
        contains: cidade,
      }
    }

    if (estado) {
      where.estado = estado
    }

    // Buscar fornecedores com paginação
    const [fornecedores, total] = await Promise.all([
      prisma.fornecedor.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.fornecedor.count({ where }),
    ])

    return res.json({
      fornecedores,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar fornecedor por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
      include: {
        produtos: true,
      },
    })

    if (!fornecedor) {
      throw new AppError("Fornecedor não encontrado", 404)
    }

    return res.json(fornecedor)
  }

  /**
   * Criar novo fornecedor
   */
  async create(req, res) {
    const { nome, cnpj, telefone, email, endereco, cidade, estado, cep, contato } = req.body

    // Verificar se já existe um fornecedor com o mesmo CNPJ
    if (cnpj) {
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { cnpj },
      })

      if (fornecedorExistente) {
        throw new AppError("Já existe um fornecedor com este CNPJ", 409)
      }
    }

    // Criar fornecedor
    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        cidade,
        estado,
        cep,
        contato,
      },
    })

    return res.status(201).json(fornecedor)
  }

  /**
   * Atualizar fornecedor
   */
  async update(req, res) {
    const { id } = req.params
    const { nome, cnpj, telefone, email, endereco, cidade, estado, cep, contato } = req.body

    // Verificar se o fornecedor existe
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
    })

    if (!fornecedor) {
      throw new AppError("Fornecedor não encontrado", 404)
    }

    // Verificar se já existe outro fornecedor com o mesmo CNPJ
    if (cnpj && cnpj !== fornecedor.cnpj) {
      const fornecedorExistente = await prisma.fornecedor.findUnique({
        where: { cnpj },
      })

      if (fornecedorExistente) {
        throw new AppError("Já existe um fornecedor com este CNPJ", 409)
      }
    }

    // Atualizar fornecedor
    const fornecedorAtualizado = await prisma.fornecedor.update({
      where: { id: Number(id) },
      data: {
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        cidade,
        estado,
        cep,
        contato,
      },
    })

    return res.json(fornecedorAtualizado)
  }

  /**
   * Excluir fornecedor
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o fornecedor existe
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
    })

    if (!fornecedor) {
      throw new AppError("Fornecedor não encontrado", 404)
    }

    // Verificar se existem produtos associados ao fornecedor
    const produtosAssociados = await prisma.produto.count({
      where: { fornecedor_id: Number(id) },
    })

    if (produtosAssociados > 0) {
      throw new AppError("Não é possível excluir o fornecedor pois existem produtos associados a ele", 400)
    }

    // Excluir fornecedor
    await prisma.fornecedor.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar produtos do fornecedor
   */
  async findProdutos(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se o fornecedor existe
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
    })

    if (!fornecedor) {
      throw new AppError("Fornecedor não encontrado", 404)
    }

    // Construir filtro
    const where = { fornecedor_id: Number(id) }
    if (status) where.status = status

    // Buscar produtos do fornecedor
    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categoria: true,
      },
      orderBy: { nome: "asc" },
    })

    return res.json(produtos)
  }
}

module.exports = new FornecedorController()
