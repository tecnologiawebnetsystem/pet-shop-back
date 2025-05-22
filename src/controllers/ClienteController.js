const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class ClienteController {
  /**
   * Listar todos os clientes
   */
  async findAll(req, res) {
    const { nome, cpf, cidade, estado, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (nome) {
      where.usuario = {
        nome: {
          contains: nome,
        },
      }
    }

    if (cpf) {
      where.cpf = {
        contains: cpf,
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

    // Buscar clientes com paginação
    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              status: true,
            },
          },
        },
        skip,
        take: Number(limit),
        orderBy: {
          usuario: {
            nome: "asc",
          },
        },
      }),
      prisma.cliente.count({ where }),
    ])

    return res.json({
      clientes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar cliente por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            status: true,
          },
        },
        pets: true,
      },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    return res.json(cliente)
  }

  /**
   * Criar novo cliente
   */
  async create(req, res) {
    const { usuario_id, cpf, endereco, cidade, estado, cep, data_nascimento, observacoes } = req.body

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Verificar se o usuário já está associado a um cliente
    const clienteExistente = await prisma.cliente.findUnique({
      where: { usuario_id: Number(usuario_id) },
    })

    if (clienteExistente) {
      throw new AppError("Este usuário já está associado a um cliente", 409)
    }

    // Verificar se o CPF já está em uso
    if (cpf) {
      const cpfExistente = await prisma.cliente.findUnique({
        where: { cpf },
      })

      if (cpfExistente) {
        throw new AppError("CPF já está em uso", 409)
      }
    }

    // Criar cliente
    const cliente = await prisma.cliente.create({
      data: {
        usuario_id: Number(usuario_id),
        cpf,
        endereco,
        cidade,
        estado,
        cep,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        observacoes,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    })

    return res.status(201).json(cliente)
  }

  /**
   * Atualizar cliente
   */
  async update(req, res) {
    const { id } = req.params
    const { cpf, endereco, cidade, estado, cep, data_nascimento, observacoes } = req.body

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Verificar se o CPF já está em uso por outro cliente
    if (cpf && cpf !== cliente.cpf) {
      const cpfExistente = await prisma.cliente.findUnique({
        where: { cpf },
      })

      if (cpfExistente) {
        throw new AppError("CPF já está em uso", 409)
      }
    }

    // Atualizar cliente
    const clienteAtualizado = await prisma.cliente.update({
      where: { id: Number(id) },
      data: {
        cpf,
        endereco,
        cidade,
        estado,
        cep,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : cliente.data_nascimento,
        observacoes,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
      },
    })

    return res.json(clienteAtualizado)
  }

  /**
   * Excluir cliente
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Excluir cliente
    await prisma.cliente.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar pets do cliente
   */
  async findPets(req, res) {
    const { id } = req.params

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Buscar pets do cliente
    const pets = await prisma.pet.findMany({
      where: { cliente_id: Number(id) },
    })

    return res.json(pets)
  }

  /**
   * Listar agendamentos do cliente
   */
  async findAgendamentos(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Construir filtro
    const where = { cliente_id: Number(id) }
    if (status) where.status = status

    // Buscar agendamentos do cliente
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
        pet: true,
        servico: true,
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

  /**
   * Listar compras do cliente
   */
  async findCompras(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Construir filtro
    const where = { cliente_id: Number(id) }
    if (status) where.status = status

    // Buscar compras do cliente
    const compras = await prisma.venda.findMany({
      where,
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        data: "desc",
      },
    })

    return res.json(compras)
  }
}

module.exports = new ClienteController()
