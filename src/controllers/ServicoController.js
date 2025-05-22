const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class ServicoController {
  /**
   * Listar todos os serviços
   */
  async findAll(req, res) {
    const { nome, categoria_id, status, page = 1, limit = 10 } = req.query
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

    if (status) {
      where.status = status
    }

    // Buscar serviços com paginação
    const [servicos, total] = await Promise.all([
      prisma.servico.findMany({
        where,
        include: {
          categoria: true,
        },
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.servico.count({ where }),
    ])

    return res.json({
      servicos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar serviço por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const servico = await prisma.servico.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
      },
    })

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404)
    }

    return res.json(servico)
  }

  /**
   * Criar novo serviço
   */
  async create(req, res) {
    const { nome, descricao, preco, duracao, categoria_id, status = "ativo" } = req.body

    // Verificar se a categoria existe, se fornecida
    if (categoria_id) {
      const categoria = await prisma.categoriaServico.findUnique({
        where: { id: Number(categoria_id) },
      })

      if (!categoria) {
        throw new AppError("Categoria de serviço não encontrada", 404)
      }
    }

    // Criar serviço
    const servico = await prisma.servico.create({
      data: {
        nome,
        descricao,
        preco: Number(preco),
        duracao: duracao ? Number(duracao) : null,
        categoria_id: categoria_id ? Number(categoria_id) : null,
        status,
      },
      include: {
        categoria: true,
      },
    })

    return res.status(201).json(servico)
  }

  /**
   * Atualizar serviço
   */
  async update(req, res) {
    const { id } = req.params
    const { nome, descricao, preco, duracao, categoria_id, status } = req.body

    // Verificar se o serviço existe
    const servico = await prisma.servico.findUnique({
      where: { id: Number(id) },
    })

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404)
    }

    // Verificar se a categoria existe, se fornecida
    if (categoria_id) {
      const categoria = await prisma.categoriaServico.findUnique({
        where: { id: Number(categoria_id) },
      })

      if (!categoria) {
        throw new AppError("Categoria de serviço não encontrada", 404)
      }
    }

    // Atualizar serviço
    const servicoAtualizado = await prisma.servico.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco: preco ? Number(preco) : undefined,
        duracao: duracao ? Number(duracao) : undefined,
        categoria_id: categoria_id ? Number(categoria_id) : undefined,
        status,
      },
      include: {
        categoria: true,
      },
    })

    return res.json(servicoAtualizado)
  }

  /**
   * Excluir serviço
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o serviço existe
    const servico = await prisma.servico.findUnique({
      where: { id: Number(id) },
    })

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404)
    }

    // Verificar se existem agendamentos associados ao serviço
    const agendamentosAssociados = await prisma.agendamento.count({
      where: { servico_id: Number(id) },
    })

    if (agendamentosAssociados > 0) {
      throw new AppError("Não é possível excluir o serviço pois existem agendamentos associados a ele", 400)
    }

    // Excluir serviço
    await prisma.servico.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar agendamentos do serviço
   */
  async findAgendamentos(req, res) {
    const { id } = req.params
    const { status, data_inicio, data_fim } = req.query

    // Verificar se o serviço existe
    const servico = await prisma.servico.findUnique({
      where: { id: Number(id) },
    })

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404)
    }

    // Construir filtro
    const where = { servico_id: Number(id) }
    if (status) where.status = status

    if (data_inicio || data_fim) {
      where.data = {}
      if (data_inicio) where.data.gte = new Date(data_inicio)
      if (data_fim) where.data.lte = new Date(data_fim)
    }

    // Buscar agendamentos do serviço
    const agendamentos = await prisma.agendamento.findMany({
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
        pet: true,
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        data: "desc",
      },
    })

    return res.json(agendamentos)
  }
}

module.exports = new ServicoController()
