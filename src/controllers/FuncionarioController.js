const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class FuncionarioController {
  /**
   * Listar todos os funcionários
   */
  async findAll(req, res) {
    const { nome, cargo, especialidade, page = 1, limit = 10 } = req.query
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

    if (cargo) {
      where.cargo = {
        contains: cargo,
      }
    }

    if (especialidade) {
      where.especialidade = {
        contains: especialidade,
      }
    }

    // Buscar funcionários com paginação
    const [funcionarios, total] = await Promise.all([
      prisma.funcionario.findMany({
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
      prisma.funcionario.count({ where }),
    ])

    return res.json({
      funcionarios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar funcionário por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const funcionario = await prisma.funcionario.findUnique({
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
      },
    })

    if (!funcionario) {
      throw new AppError("Funcionário não encontrado", 404)
    }

    return res.json(funcionario)
  }

  /**
   * Criar novo funcionário
   */
  async create(req, res) {
    const { usuario_id, cargo, salario, data_contratacao, documento, especialidade } = req.body

    // Verificar se o usuário existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(usuario_id) },
    })

    if (!usuario) {
      throw new AppError("Usuário não encontrado", 404)
    }

    // Verificar se o usuário já está associado a um funcionário
    const funcionarioExistente = await prisma.funcionario.findUnique({
      where: { usuario_id: Number(usuario_id) },
    })

    if (funcionarioExistente) {
      throw new AppError("Este usuário já está associado a um funcionário", 409)
    }

    // Criar funcionário
    const funcionario = await prisma.funcionario.create({
      data: {
        usuario_id: Number(usuario_id),
        cargo,
        salario: salario ? Number(salario) : null,
        data_contratacao: data_contratacao ? new Date(data_contratacao) : null,
        documento,
        especialidade,
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

    return res.status(201).json(funcionario)
  }

  /**
   * Atualizar funcionário
   */
  async update(req, res) {
    const { id } = req.params
    const { cargo, salario, data_contratacao, documento, especialidade } = req.body

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    })

    if (!funcionario) {
      throw new AppError("Funcionário não encontrado", 404)
    }

    // Atualizar funcionário
    const funcionarioAtualizado = await prisma.funcionario.update({
      where: { id: Number(id) },
      data: {
        cargo,
        salario: salario ? Number(salario) : funcionario.salario,
        data_contratacao: data_contratacao ? new Date(data_contratacao) : funcionario.data_contratacao,
        documento,
        especialidade,
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

    return res.json(funcionarioAtualizado)
  }

  /**
   * Excluir funcionário
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    })

    if (!funcionario) {
      throw new AppError("Funcionário não encontrado", 404)
    }

    // Excluir funcionário
    await prisma.funcionario.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Listar agendamentos do funcionário
   */
  async findAgendamentos(req, res) {
    const { id } = req.params
    const { data, status } = req.query

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    })

    if (!funcionario) {
      throw new AppError("Funcionário não encontrado", 404)
    }

    // Construir filtro
    const where = { funcionario_id: Number(id) }
    if (data) where.data = new Date(data)
    if (status) where.status = status

    // Buscar agendamentos do funcionário
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
        servico: true,
      },
      orderBy: [{ data: "asc" }, { hora_inicio: "asc" }],
    })

    return res.json(agendamentos)
  }

  /**
   * Listar tarefas do funcionário
   */
  async findTarefas(req, res) {
    const { id } = req.params
    const { data, status, prioridade } = req.query

    // Verificar se o funcionário existe
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: Number(id) },
    })

    if (!funcionario) {
      throw new AppError("Funcionário não encontrado", 404)
    }

    // Construir filtro
    const where = { funcionario_id: Number(id) }
    if (data) where.data = new Date(data)
    if (status) where.status = status
    if (prioridade) where.prioridade = prioridade

    // Buscar tarefas do funcionário
    const tarefas = await prisma.tarefa.findMany({
      where,
      orderBy: [{ data: "asc" }, { hora: "asc" }, { prioridade: "desc" }],
    })

    return res.json(tarefas)
  }
}

module.exports = new FuncionarioController()
