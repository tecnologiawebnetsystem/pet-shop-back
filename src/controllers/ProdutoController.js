const prisma = require("../config/database")
const AppError = require("../utils/AppError")
const path = require("path")
const fs = require("fs")

class ProdutoController {
  /**
   * Listar todos os produtos
   */
  async findAll(req, res) {
    const { nome, categoria_id, fornecedor_id, codigo_barras, estoque_minimo, status, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (nome) {
      where.nome = {
        contains: nome,
      }
    }

    if (categoria_id) {
      where.categoria_id = Number(categoria_id)
    }

    if (fornecedor_id) {
      where.fornecedor_id = Number(fornecedor_id)
    }

    if (codigo_barras) {
      where.codigo_barras = {
        contains: codigo_barras,
      }
    }

    if (estoque_minimo) {
      where.estoque = {
        lte: Number(estoque_minimo),
      }
    }

    if (status) {
      where.status = status
    }

    // Buscar produtos com paginação
    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        include: {
          categoria: true,
          fornecedor: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.produto.count({ where }),
    ])

    return res.json({
      produtos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar produto por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        fornecedor: {
          select: {
            id: true,
            nome: true,
            cnpj: true,
            telefone: true,
            email: true,
          },
        },
      },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    return res.json(produto)
  }

  /**
   * Criar novo produto
   */
  async create(req, res) {
    const {
      nome,
      descricao,
      preco,
      preco_custo,
      estoque,
      estoque_minimo,
      categoria_id,
      fornecedor_id,
      codigo_barras,
      status = "ativo",
    } = req.body

    // Verificar se a categoria existe, se fornecida
    if (categoria_id) {
      const categoria = await prisma.categoriaProduto.findUnique({
        where: { id: Number(categoria_id) },
      })

      if (!categoria) {
        throw new AppError("Categoria de produto não encontrada", 404)
      }
    }

    // Verificar se o fornecedor existe, se fornecido
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedor.findUnique({
        where: { id: Number(fornecedor_id) },
      })

      if (!fornecedor) {
        throw new AppError("Fornecedor não encontrado", 404)
      }
    }

    // Verificar se já existe um produto com o mesmo código de barras
    if (codigo_barras) {
      const produtoExistente = await prisma.produto.findFirst({
        where: { codigo_barras },
      })

      if (produtoExistente) {
        throw new AppError("Já existe um produto com este código de barras", 409)
      }
    }

    // Criar produto
    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: Number(preco),
        preco_custo: preco_custo ? Number(preco_custo) : null,
        estoque: estoque ? Number(estoque) : 0,
        estoque_minimo: estoque_minimo ? Number(estoque_minimo) : 0,
        categoria_id: categoria_id ? Number(categoria_id) : null,
        fornecedor_id: fornecedor_id ? Number(fornecedor_id) : null,
        codigo_barras,
        status,
      },
      include: {
        categoria: true,
        fornecedor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    return res.status(201).json(produto)
  }

  /**
   * Atualizar produto
   */
  async update(req, res) {
    const { id } = req.params
    const {
      nome,
      descricao,
      preco,
      preco_custo,
      estoque,
      estoque_minimo,
      categoria_id,
      fornecedor_id,
      codigo_barras,
      status,
    } = req.body

    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    // Verificar se a categoria existe, se fornecida
    if (categoria_id) {
      const categoria = await prisma.categoriaProduto.findUnique({
        where: { id: Number(categoria_id) },
      })

      if (!categoria) {
        throw new AppError("Categoria de produto não encontrada", 404)
      }
    }

    // Verificar se o fornecedor existe, se fornecido
    if (fornecedor_id) {
      const fornecedor = await prisma.fornecedor.findUnique({
        where: { id: Number(fornecedor_id) },
      })

      if (!fornecedor) {
        throw new AppError("Fornecedor não encontrado", 404)
      }
    }

    // Verificar se já existe outro produto com o mesmo código de barras
    if (codigo_barras && codigo_barras !== produto.codigo_barras) {
      const produtoExistente = await prisma.produto.findFirst({
        where: { codigo_barras },
      })

      if (produtoExistente) {
        throw new AppError("Já existe um produto com este código de barras", 409)
      }
    }

    // Atualizar produto
    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco: preco ? Number(preco) : undefined,
        preco_custo: preco_custo ? Number(preco_custo) : undefined,
        estoque: estoque !== undefined ? Number(estoque) : undefined,
        estoque_minimo: estoque_minimo ? Number(estoque_minimo) : undefined,
        categoria_id: categoria_id ? Number(categoria_id) : undefined,
        fornecedor_id: fornecedor_id ? Number(fornecedor_id) : undefined,
        codigo_barras,
        status,
      },
      include: {
        categoria: true,
        fornecedor: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    return res.json(produtoAtualizado)
  }

  /**
   * Excluir produto
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    // Verificar se existem itens de venda associados ao produto
    const itensVendaAssociados = await prisma.itemVenda.count({
      where: { produto_id: Number(id) },
    })

    if (itensVendaAssociados > 0) {
      throw new AppError("Não é possível excluir o produto pois existem vendas associadas a ele", 400)
    }

    // Se o produto tiver imagem, excluir o arquivo
    if (produto.imagem) {
      const imagemPath = path.resolve(process.env.UPLOAD_FOLDER, "produtos", produto.imagem)
      try {
        if (fs.existsSync(imagemPath)) {
          fs.unlinkSync(imagemPath)
        }
      } catch (error) {
        console.error("Erro ao excluir imagem do produto:", error)
      }
    }

    // Excluir produto
    await prisma.produto.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Upload de imagem do produto
   */
  async uploadImagem(req, res) {
    const { id } = req.params
    const { file } = req

    if (!file) {
      throw new AppError("Nenhum arquivo enviado", 400)
    }

    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    // Se o produto já tiver imagem, excluir o arquivo anterior
    if (produto.imagem) {
      const imagemAnteriorPath = path.resolve(process.env.UPLOAD_FOLDER, "produtos", produto.imagem)
      try {
        if (fs.existsSync(imagemAnteriorPath)) {
          fs.unlinkSync(imagemAnteriorPath)
        }
      } catch (error) {
        console.error("Erro ao excluir imagem anterior do produto:", error)
      }
    }

    // Atualizar produto com a nova imagem
    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        imagem: file.filename,
      },
    })

    return res.json({
      message: "Imagem atualizada com sucesso",
      produto: produtoAtualizado,
    })
  }

  /**
   * Atualizar estoque do produto
   */
  async updateEstoque(req, res) {
    const { id } = req.params
    const { quantidade, operacao = "adicionar" } = req.body

    if (!quantidade || isNaN(quantidade) || Number(quantidade) <= 0) {
      throw new AppError("Quantidade inválida", 400)
    }

    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    let novoEstoque = produto.estoque

    if (operacao === "adicionar") {
      novoEstoque += Number(quantidade)
    } else if (operacao === "remover") {
      if (produto.estoque < Number(quantidade)) {
        throw new AppError("Estoque insuficiente", 400)
      }
      novoEstoque -= Number(quantidade)
    } else {
      throw new AppError("Operação inválida. Use 'adicionar' ou 'remover'", 400)
    }

    // Atualizar estoque do produto
    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        estoque: novoEstoque,
      },
    })

    return res.json({
      message: `Estoque ${operacao === "adicionar" ? "adicionado" : "removido"} com sucesso`,
      produto: produtoAtualizado,
    })
  }
}

module.exports = new ProdutoController()
