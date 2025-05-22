const prisma = require("../config/database")
const AppError = require("../utils/AppError")
const { sendEmail } = require("../config/email")

class VendaController {
  /**
   * Listar todas as vendas
   */
  async findAll(req, res) {
    const {
      cliente_id,
      funcionario_id,
      data_inicio,
      data_fim,
      forma_pagamento,
      status,
      page = 1,
      limit = 10,
    } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (cliente_id) {
      where.cliente_id = Number(cliente_id)
    }

    if (funcionario_id) {
      where.funcionario_id = Number(funcionario_id)
    }

    if (data_inicio || data_fim) {
      where.data = {}
      if (data_inicio) where.data.gte = new Date(data_inicio)
      if (data_fim) where.data.lte = new Date(data_fim)
    }

    if (forma_pagamento) {
      where.forma_pagamento = forma_pagamento
    }

    if (status) {
      where.status = status
    }

    // Buscar vendas com paginação
    const [vendas, total] = await Promise.all([
      prisma.venda.findMany({
        where,
        include: {
          cliente: {
            include: {
              usuario: {
                select: {
                  nome: true,
                },
              },
            },
          },
          funcionario: {
            include: {
              usuario: {
                select: {
                  nome: true,
                },
              },
            },
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: { data: "desc" },
      }),
      prisma.venda.count({ where }),
    ])

    return res.json({
      vendas,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar venda por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const venda = await prisma.venda.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
              },
            },
          },
        },
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    if (!venda) {
      throw new AppError("Venda não encontrada", 404)
    }

    return res.json(venda)
  }

  /**
   * Criar nova venda
   */
  async create(req, res) {
    const { cliente_id, funcionario_id, itens, desconto = 0, forma_pagamento, observacoes } = req.body

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(cliente_id) },
      include: {
        usuario: true,
      },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Verificar se o funcionário existe, se fornecido
    if (funcionario_id) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: Number(funcionario_id) },
      })

      if (!funcionario) {
        throw new AppError("Funcionário não encontrado", 404)
      }
    }

    // Verificar se foram informados itens
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      throw new AppError("É necessário informar pelo menos um item para a venda", 400)
    }

    // Verificar e processar itens
    const itensProcessados = []
    let valorTotal = 0

    for (const item of itens) {
      // Verificar se o produto existe
      const produto = await prisma.produto.findUnique({
        where: { id: Number(item.produto_id) },
      })

      if (!produto) {
        throw new AppError(`Produto com ID ${item.produto_id} não encontrado`, 404)
      }

      // Verificar se o produto está ativo
      if (produto.status === "inativo") {
        throw new AppError(`O produto ${produto.nome} está inativo`, 400)
      }

      // Verificar estoque
      if (produto.estoque < item.quantidade) {
        throw new AppError(`Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque}`, 400)
      }

      // Calcular valores
      const valorUnitario = produto.preco
      const descontoItem = item.desconto || 0
      const valorTotalItem = valorUnitario * item.quantidade - descontoItem

      // Adicionar ao valor total
      valorTotal += valorTotalItem

      // Adicionar item processado
      itensProcessados.push({
        produto_id: Number(item.produto_id),
        quantidade: Number(item.quantidade),
        valor_unitario: valorUnitario,
        desconto: descontoItem,
        valor_total: valorTotalItem,
      })

      // Atualizar estoque do produto
      await prisma.produto.update({
        where: { id: Number(item.produto_id) },
        data: {
          estoque: {
            decrement: Number(item.quantidade),
          },
        },
      })
    }

    // Aplicar desconto geral
    const descontoGeral = Number(desconto)
    valorTotal -= descontoGeral

    // Criar venda com itens
    const venda = await prisma.venda.create({
      data: {
        cliente_id: Number(cliente_id),
        funcionario_id: funcionario_id ? Number(funcionario_id) : null,
        data: new Date(),
        valor_total: valorTotal,
        desconto: descontoGeral,
        forma_pagamento,
        status: "concluida",
        observacoes,
        itens: {
          create: itensProcessados,
        },
      },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    })

    // Enviar email de confirmação para o cliente
    try {
      const dataFormatada = venda.data.toLocaleDateString("pt-BR")

      const itensHtml = venda.itens
        .map(
          (item) => `
        <tr>
          <td>${item.produto.nome}</td>
          <td>${item.quantidade}</td>
          <td>R$ ${item.valor_unitario.toFixed(2)}</td>
          <td>R$ ${item.desconto.toFixed(2)}</td>
          <td>R$ ${item.valor_total.toFixed(2)}</td>
        </tr>
      `,
        )
        .join("")

      const emailHtml = `
        <h1>Confirmação de Compra</h1>
        <p>Olá ${cliente.usuario.nome},</p>
        <p>Sua compra foi realizada com sucesso!</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Valor Total:</strong> R$ ${valorTotal.toFixed(2)}</p>
        <p><strong>Forma de Pagamento:</strong> ${forma_pagamento}</p>
        
        <h2>Itens da Compra</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Desconto</th>
            <th>Valor Total</th>
          </tr>
          ${itensHtml}
        </table>
        
        <p>Agradecemos a preferência!</p>
      `

      await sendEmail(cliente.usuario.email, "Confirmação de Compra", emailHtml)
    } catch (error) {
      console.error("Erro ao enviar email de confirmação:", error)
    }

    return res.status(201).json(venda)
  }

  /**
   * Atualizar venda
   */
  async update(req, res) {
    const { id } = req.params
    const { forma_pagamento, status, observacoes } = req.body

    // Verificar se a venda existe
    const venda = await prisma.venda.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
      },
    })

    if (!venda) {
      throw new AppError("Venda não encontrada", 404)
    }

    // Não permitir alterações em vendas canceladas
    if (venda.status === "cancelada") {
      throw new AppError("Não é possível alterar uma venda cancelada", 400)
    }

    // Atualizar venda
    const vendaAtualizada = await prisma.venda.update({
      where: { id: Number(id) },
      data: {
        forma_pagamento,
        status,
        observacoes,
      },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    // Se o status for alterado para "cancelada", devolver os produtos ao estoque
    if (status === "cancelada" && venda.status !== "cancelada") {
      // Buscar itens da venda
      const itens = await prisma.itemVenda.findMany({
        where: { venda_id: Number(id) },
        include: {
          produto: true,
        },
      })

      // Devolver produtos ao estoque
      for (const item of itens) {
        await prisma.produto.update({
          where: { id: item.produto_id },
          data: {
            estoque: {
              increment: item.quantidade,
            },
          },
        })
      }

      // Enviar email de cancelamento para o cliente
      try {
        const dataFormatada = venda.data.toLocaleDateString("pt-BR")

        const emailHtml = `
          <h1>Cancelamento de Compra</h1>
          <p>Olá ${venda.cliente.usuario.nome},</p>
          <p>Sua compra realizada em ${dataFormatada} foi cancelada.</p>
          <p><strong>Valor Total:</strong> R$ ${venda.valor_total.toFixed(2)}</p>
          <p>Em caso de dúvidas, entre em contato conosco.</p>
        `

        await sendEmail(venda.cliente.usuario.email, "Cancelamento de Compra", emailHtml)
      } catch (error) {
        console.error("Erro ao enviar email de cancelamento:", error)
      }
    }

    return res.json(vendaAtualizada)
  }

  /**
   * Excluir venda
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se a venda existe
    const venda = await prisma.venda.findUnique({
      where: { id: Number(id) },
      include: {
        itens: true,
        cliente: {
          include: {
            usuario: true,
          },
        },
      },
    })

    if (!venda) {
      throw new AppError("Venda não encontrada", 404)
    }

    // Devolver produtos ao estoque
    for (const item of venda.itens) {
      await prisma.produto.update({
        where: { id: item.produto_id },
        data: {
          estoque: {
            increment: item.quantidade,
          },
        },
      })
    }

    // Excluir venda (os itens serão excluídos automaticamente devido ao onDelete: Cascade)
    await prisma.venda.delete({
      where: { id: Number(id) },
    })

    // Enviar email de cancelamento para o cliente
    try {
      const dataFormatada = venda.data.toLocaleDateString("pt-BR")

      const emailHtml = `
        <h1>Cancelamento de Compra</h1>
        <p>Olá ${venda.cliente.usuario.nome},</p>
        <p>Sua compra realizada em ${dataFormatada} foi cancelada.</p>
        <p><strong>Valor Total:</strong> R$ ${venda.valor_total.toFixed(2)}</p>
        <p>Em caso de dúvidas, entre em contato conosco.</p>
      `

      await sendEmail(venda.cliente.usuario.email, "Cancelamento de Compra", emailHtml)
    } catch (error) {
      console.error("Erro ao enviar email de cancelamento:", error)
    }

    return res.status(204).send()
  }
}

module.exports = new VendaController()
