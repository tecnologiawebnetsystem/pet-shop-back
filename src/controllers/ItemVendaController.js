const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class ItemVendaController {
  /**
   * Listar todos os itens de venda
   */
  async findAll(req, res) {
    const { venda_id, produto_id, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (venda_id) {
      where.venda_id = Number(venda_id)
    }

    if (produto_id) {
      where.produto_id = Number(produto_id)
    }

    // Buscar itens de venda com paginação
    const [itens, total] = await Promise.all([
      prisma.itemVenda.findMany({
        where,
        include: {
          venda: {
            select: {
              id: true,
              data: true,
              status: true,
            },
          },
          produto: {
            select: {
              id: true,
              nome: true,
              codigo_barras: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: [{ venda_id: "desc" }, { id: "asc" }],
      }),
      prisma.itemVenda.count({ where }),
    ])

    return res.json({
      itens,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar item de venda por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const item = await prisma.itemVenda.findUnique({
      where: { id: Number(id) },
      include: {
        venda: {
          select: {
            id: true,
            data: true,
            cliente_id: true,
            status: true,
            cliente: {
              include: {
                usuario: {
                  select: {
                    nome: true,
                  },
                },
              },
            },
          },
        },
        produto: true,
      },
    })

    if (!item) {
      throw new AppError("Item de venda não encontrado", 404)
    }

    return res.json(item)
  }

  /**
   * Criar novo item de venda
   */
  async create(req, res) {
    const { venda_id, produto_id, quantidade, valor_unitario, desconto = 0 } = req.body

    // Verificar se a venda existe
    const venda = await prisma.venda.findUnique({
      where: { id: Number(venda_id) },
    })

    if (!venda) {
      throw new AppError("Venda não encontrada", 404)
    }

    // Não permitir adicionar itens a vendas canceladas
    if (venda.status === "cancelada") {
      throw new AppError("Não é possível adicionar itens a uma venda cancelada", 400)
    }

    // Verificar se o produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: Number(produto_id) },
    })

    if (!produto) {
      throw new AppError("Produto não encontrado", 404)
    }

    // Verificar se o produto está ativo
    if (produto.status === "inativo") {
      throw new AppError("O produto está inativo", 400)
    }

    // Verificar estoque
    if (produto.estoque < quantidade) {
      throw new AppError(`Estoque insuficiente. Disponível: ${produto.estoque}`, 400)
    }

    // Calcular valor total
    const valorTotal = (valor_unitario || produto.preco) * quantidade - desconto

    // Criar item de venda
    const item = await prisma.itemVenda.create({
      data: {
        venda_id: Number(venda_id),
        produto_id: Number(produto_id),
        quantidade: Number(quantidade),
        valor_unitario: valor_unitario || produto.preco,
        desconto: Number(desconto),
        valor_total: valorTotal,
      },
      include: {
        produto: true,
      },
    })

    // Atualizar valor total da venda
    await prisma.venda.update({
      where: { id: Number(venda_id) },
      data: {
        valor_total: {
          increment: valorTotal,
        },
      },
    })

    // Atualizar estoque do produto
    await prisma.produto.update({
      where: { id: Number(produto_id) },
      data: {
        estoque: {
          decrement: Number(quantidade),
        },
      },
    })

    return res.status(201).json(item)
  }

  /**
   * Atualizar item de venda
   */
  async update(req, res) {
    const { id } = req.params
    const { quantidade, valor_unitario, desconto } = req.body

    // Verificar se o item de venda existe
    const item = await prisma.itemVenda.findUnique({
      where: { id: Number(id) },
      include: {
        venda: true,
        produto: true,
      },
    })

    if (!item) {
      throw new AppError("Item de venda não encontrado", 404)
    }

    // Não permitir alterar itens de vendas canceladas
    if (item.venda.status === "cancelada") {
      throw new AppError("Não é possível alterar itens de uma venda cancelada", 400)
    }

    // Calcular diferença de quantidade para atualizar estoque
    const diferencaQuantidade = Number(quantidade) - item.quantidade

    // Verificar estoque se estiver aumentando a quantidade
    if (diferencaQuantidade > 0 && item.produto.estoque < diferencaQuantidade) {
      throw new AppError(`Estoque insuficiente. Disponível: ${item.produto.estoque}`, 400)
    }

    // Calcular valor total anterior
    const valorTotalAnterior = item.valor_total

    // Calcular novo valor total
    const novoValorUnitario = valor_unitario !== undefined ? Number(valor_unitario) : item.valor_unitario
    const novoDesconto = desconto !== undefined ? Number(desconto) : item.desconto
    const novoValorTotal =
      novoValorUnitario * (quantidade !== undefined ? Number(quantidade) : item.quantidade) - novoDesconto

    // Calcular diferença de valor para atualizar venda
    const diferencaValor = novoValorTotal - valorTotalAnterior

    // Atualizar item de venda
    const itemAtualizado = await prisma.itemVenda.update({
      where: { id: Number(id) },
      data: {
        quantidade: quantidade !== undefined ? Number(quantidade) : undefined,
        valor_unitario: valor_unitario !== undefined ? Number(valor_unitario) : undefined,
        desconto: desconto !== undefined ? Number(desconto) : undefined,
        valor_total: novoValorTotal,
      },
      include: {
        produto: true,
      },
    })

    // Atualizar valor total da venda
    await prisma.venda.update({
      where: { id: item.venda_id },
      data: {
        valor_total: {
          increment: diferencaValor,
        },
      },
    })

    // Atualizar estoque do produto se a quantidade foi alterada
    if (diferencaQuantidade !== 0) {
      await prisma.produto.update({
        where: { id: item.produto_id },
        data: {
          estoque: {
            decrement: diferencaQuantidade,
          },
        },
      })
    }

    return res.json(itemAtualizado)
  }

  /**
   * Excluir item de venda
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o item de venda existe
    const item = await prisma.itemVenda.findUnique({
      where: { id: Number(id) },
      include: {
        venda: true,
      },
    })

    if (!item) {
      throw new AppError("Item de venda não encontrado", 404)
    }

    // Não permitir excluir itens de vendas canceladas
    if (item.venda.status === "cancelada") {
      throw new AppError("Não é possível excluir itens de uma venda cancelada", 400)
    }

    // Atualizar valor total da venda
    await prisma.venda.update({
      where: { id: item.venda_id },
      data: {
        valor_total: {
          decrement: item.valor_total,
        },
      },
    })

    // Devolver quantidade ao estoque do produto
    await prisma.produto.update({
      where: { id: item.produto_id },
      data: {
        estoque: {
          increment: item.quantidade,
        },
      },
    })

    // Excluir item de venda
    await prisma.itemVenda.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }
}

module.exports = new ItemVendaController()
