const prisma = require("../config/database")
const AppError = require("../utils/AppError")

class TarefaController {
  /**
   * Listar todas as tarefas
   */
  async findAll(req, res) {
    const { funcionario_id, titulo, data, data_inicio, data_fim, prioridade, status, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (funcionario_id) {
      where.funcionario_id = Number(funcionario_id)
    }

    if (titulo) {
      where.titulo = {
        contains: titulo,
      }
    }

    if (data) {
      where.data = new Date(data)
    } else if (data_inicio || data_fim) {
      where.data = {}
      if (data_inicio) where.data.gte = new Date(data_inicio)
      if (data_fim) where.data.lte = new Date(data_fim)
    }

    if (prioridade) {
      where.prioridade = prioridade
    }

    if (status) {
      where.status = status
    }

    // Buscar tarefas com paginação
    const [tarefas, total] = await Promise.all([
      prisma.tarefa.findMany({
        where,
        include: {
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
        skip,
        take: Number(limit),
        orderBy: [{ data: "asc" }, { hora: "asc" }, { prioridade: "desc" }],
      }),
      prisma.tarefa.count({ where }),
    ])

    return res.json({
      tarefas,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar tarefa por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const tarefa = await prisma.tarefa.findUnique({
      where: { id: Number(id) },
      include: {
        funcionario: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!tarefa) {
      throw new AppError("Tarefa não encontrada", 404)
    }

    return res.json(tarefa)
  }

  /**
   * Criar nova tarefa
   */
  async create(req, res) {
    const { funcionario_id, titulo, descricao, data, hora, prioridade = "media", status = "pendente" } = req.body

    // Verificar se o funcionário existe, se fornecido
    if (funcionario_id) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: Number(funcionario_id) },
        include: {
          usuario: true,
        },
      })

      if (!funcionario) {
        throw new AppError("Funcionário não encontrado", 404)
      }

      if (funcionario.usuario.status === "inativo") {
        throw new AppError("Este funcionário está inativo", 400)
      }
    }

    // Criar tarefa
    const tarefa = await prisma.tarefa.create({
      data: {
        funcionario_id: funcionario_id ? Number(funcionario_id) : null,
        titulo,
        descricao,
        data: new Date(data),
        hora: new Date(`${data}T${hora}`),
        prioridade,
        status,
      },
      include: {
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
    })

    return res.status(201).json(tarefa)
  }

  /**
   * Atualizar tarefa
   */
  async update(req, res) {
    const { id } = req.params
    const { funcionario_id, titulo, descricao, data, hora, prioridade, status } = req.body

    // Verificar se a tarefa existe
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: Number(id) },
    })

    if (!tarefa) {
      throw new AppError("Tarefa não encontrada", 404)
    }

    // Verificar se o funcionário existe, se fornecido
    if (funcionario_id) {
      const funcionario = await prisma.funcionario.findUnique({
        where: { id: Number(funcionario_id) },
        include: {
          usuario: true,
        },
      })

      if (!funcionario) {
        throw new AppError("Funcionário não encontrado", 404)
      }

      if (funcionario.usuario.status === "inativo") {
        throw new AppError("Este funcionário está inativo", 400)
      }
    }

    // Preparar dados para atualização
    const updateData = {}

    if (funcionario_id !== undefined) updateData.funcionario_id = funcionario_id ? Number(funcionario_id) : null
    if (titulo) updateData.titulo = titulo
    if (descricao !== undefined) updateData.descricao = descricao
    if (prioridade) updateData.prioridade = prioridade
    if (status) updateData.status = status

    // Atualizar data e hora, se fornecidos
    if (data) {
      updateData.data = new Date(data)

      if (hora) {
        updateData.hora = new Date(`${data}T${hora}`)
      }
    } else if (hora) {
      // Se apenas a hora for fornecida, usar a data atual da tarefa
      const dataAtual = tarefa.data.toISOString().split("T")[0]
      updateData.hora = new Date(`${dataAtual}T${hora}`)
    }

    // Atualizar tarefa
    const tarefaAtualizada = await prisma.tarefa.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
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
    })

    return res.json(tarefaAtualizada)
  }

  /**
   * Excluir tarefa
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se a tarefa existe
    const tarefa = await prisma.tarefa.findUnique({
      where: { id: Number(id) },
    })

    if (!tarefa) {
      throw new AppError("Tarefa não encontrada", 404)
    }

    // Excluir tarefa
    await prisma.tarefa.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }
}

module.exports = new TarefaController()
