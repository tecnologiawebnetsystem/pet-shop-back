const prisma = require("../config/database")
const AppError = require("../utils/AppError")
const { sendEmail } = require("../config/email")

class AgendamentoController {
  /**
   * Listar todos os agendamentos
   */
  async findAll(req, res) {
    const {
      cliente_id,
      pet_id,
      servico_id,
      funcionario_id,
      data,
      data_inicio,
      data_fim,
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

    if (pet_id) {
      where.pet_id = Number(pet_id)
    }

    if (servico_id) {
      where.servico_id = Number(servico_id)
    }

    if (funcionario_id) {
      where.funcionario_id = Number(funcionario_id)
    }

    if (data) {
      where.data = new Date(data)
    } else if (data_inicio || data_fim) {
      where.data = {}
      if (data_inicio) where.data.gte = new Date(data_inicio)
      if (data_fim) where.data.lte = new Date(data_fim)
    }

    if (status) {
      where.status = status
    }

    // Buscar agendamentos com paginação
    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
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
        skip,
        take: Number(limit),
        orderBy: [{ data: "asc" }, { hora_inicio: "asc" }],
      }),
      prisma.agendamento.count({ where }),
    ])

    return res.json({
      agendamentos,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar agendamento por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const agendamento = await prisma.agendamento.findUnique({
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
    })

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404)
    }

    return res.json(agendamento)
  }

  /**
   * Criar novo agendamento
   */
  async create(req, res) {
    const {
      cliente_id,
      pet_id,
      servico_id,
      funcionario_id,
      data,
      hora_inicio,
      hora_fim,
      status = "agendado",
      observacoes,
    } = req.body

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

    // Verificar se o pet existe e pertence ao cliente
    const pet = await prisma.pet.findUnique({
      where: { id: Number(pet_id) },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    if (pet.cliente_id !== Number(cliente_id)) {
      throw new AppError("Este pet não pertence ao cliente informado", 400)
    }

    // Verificar se o serviço existe e está ativo
    const servico = await prisma.servico.findUnique({
      where: { id: Number(servico_id) },
    })

    if (!servico) {
      throw new AppError("Serviço não encontrado", 404)
    }

    if (servico.status === "inativo") {
      throw new AppError("Este serviço está inativo", 400)
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

    // Converter strings para objetos Date
    const dataAgendamento = new Date(data)
    const horaInicio = new Date(`${data}T${hora_inicio}`)
    const horaFim = new Date(`${data}T${hora_fim}`)

    // Verificar se a data e hora são válidas
    if (horaInicio >= horaFim) {
      throw new AppError("A hora de início deve ser anterior à hora de fim", 400)
    }

    const agora = new Date()
    if (dataAgendamento < new Date(agora.setHours(0, 0, 0, 0))) {
      throw new AppError("Não é possível agendar para uma data passada", 400)
    }

    // Verificar disponibilidade do funcionário, se fornecido
    if (funcionario_id) {
      const agendamentosConflitantes = await prisma.agendamento.findMany({
        where: {
          funcionario_id: Number(funcionario_id),
          data: dataAgendamento,
          status: {
            in: ["agendado", "confirmado", "em_andamento"],
          },
          OR: [
            {
              hora_inicio: {
                lt: horaFim,
              },
              hora_fim: {
                gt: horaInicio,
              },
            },
          ],
        },
      })

      if (agendamentosConflitantes.length > 0) {
        throw new AppError("O funcionário já possui um agendamento neste horário", 409)
      }
    }

    // Criar agendamento
    const agendamento = await prisma.agendamento.create({
      data: {
        cliente_id: Number(cliente_id),
        pet_id: Number(pet_id),
        servico_id: Number(servico_id),
        funcionario_id: funcionario_id ? Number(funcionario_id) : null,
        data: dataAgendamento,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
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
        pet: true,
        servico: true,
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

    // Enviar email de confirmação para o cliente
    try {
      const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR")
      const horaInicioFormatada = horaInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

      const emailHtml = `
        <h1>Confirmação de Agendamento</h1>
        <p>Olá ${cliente.usuario.nome},</p>
        <p>Seu agendamento foi realizado com sucesso!</p>
        <p><strong>Serviço:</strong> ${servico.nome}</p>
        <p><strong>Pet:</strong> ${pet.nome}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${horaInicioFormatada}</p>
        <p>Agradecemos a preferência!</p>
      `

      await sendEmail(cliente.usuario.email, "Confirmação de Agendamento", emailHtml)
    } catch (error) {
      console.error("Erro ao enviar email de confirmação:", error)
    }

    return res.status(201).json(agendamento)
  }

  /**
   * Atualizar agendamento
   */
  async update(req, res) {
    const { id } = req.params
    const { cliente_id, pet_id, servico_id, funcionario_id, data, hora_inicio, hora_fim, status, observacoes } =
      req.body

    // Verificar se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        pet: true,
        servico: true,
      },
    })

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404)
    }

    // Verificar se o cliente existe, se fornecido
    let cliente = agendamento.cliente
    if (cliente_id && cliente_id !== agendamento.cliente_id) {
      cliente = await prisma.cliente.findUnique({
        where: { id: Number(cliente_id) },
        include: {
          usuario: true,
        },
      })

      if (!cliente) {
        throw new AppError("Cliente não encontrado", 404)
      }
    }

    // Verificar se o pet existe e pertence ao cliente, se fornecido
    let pet = agendamento.pet
    if (pet_id && pet_id !== agendamento.pet_id) {
      pet = await prisma.pet.findUnique({
        where: { id: Number(pet_id) },
      })

      if (!pet) {
        throw new AppError("Pet não encontrado", 404)
      }

      if (pet.cliente_id !== (cliente_id || agendamento.cliente_id)) {
        throw new AppError("Este pet não pertence ao cliente informado", 400)
      }
    }

    // Verificar se o serviço existe e está ativo, se fornecido
    let servico = agendamento.servico
    if (servico_id && servico_id !== agendamento.servico_id) {
      servico = await prisma.servico.findUnique({
        where: { id: Number(servico_id) },
      })

      if (!servico) {
        throw new AppError("Serviço não encontrado", 404)
      }

      if (servico.status === "inativo") {
        throw new AppError("Este serviço está inativo", 400)
      }
    }

    // Verificar se o funcionário existe, se fornecido
    if (funcionario_id && funcionario_id !== agendamento.funcionario_id) {
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

    if (cliente_id) updateData.cliente_id = Number(cliente_id)
    if (pet_id) updateData.pet_id = Number(pet_id)
    if (servico_id) updateData.servico_id = Number(servico_id)
    if (funcionario_id !== undefined) updateData.funcionario_id = funcionario_id ? Number(funcionario_id) : null
    if (observacoes !== undefined) updateData.observacoes = observacoes

    // Atualizar data e hora, se fornecidos
    let dataAgendamento = agendamento.data
    let horaInicio = agendamento.hora_inicio
    let horaFim = agendamento.hora_fim

    if (data) {
      dataAgendamento = new Date(data)
      updateData.data = dataAgendamento
    }

    if (hora_inicio) {
      horaInicio = new Date(`${dataAgendamento.toISOString().split("T")[0]}T${hora_inicio}`)
      updateData.hora_inicio = horaInicio
    }

    if (hora_fim) {
      horaFim = new Date(`${dataAgendamento.toISOString().split("T")[0]}T${hora_fim}`)
      updateData.hora_fim = horaFim
    }

    // Verificar se a data e hora são válidas
    if (horaInicio >= horaFim) {
      throw new AppError("A hora de início deve ser anterior à hora de fim", 400)
    }

    // Verificar disponibilidade do funcionário, se houver alteração de horário ou funcionário
    if ((data || hora_inicio || hora_fim || funcionario_id) && (funcionario_id || agendamento.funcionario_id)) {
      const funcionarioIdParaVerificar = funcionario_id ? Number(funcionario_id) : agendamento.funcionario_id

      const agendamentosConflitantes = await prisma.agendamento.findMany({
        where: {
          id: {
            not: Number(id),
          },
          funcionario_id: funcionarioIdParaVerificar,
          data: dataAgendamento,
          status: {
            in: ["agendado", "confirmado", "em_andamento"],
          },
          OR: [
            {
              hora_inicio: {
                lt: horaFim,
              },
              hora_fim: {
                gt: horaInicio,
              },
            },
          ],
        },
      })

      if (agendamentosConflitantes.length > 0) {
        throw new AppError("O funcionário já possui um agendamento neste horário", 409)
      }
    }

    // Atualizar status, se fornecido
    if (status) {
      updateData.status = status

      // Se o status for alterado para "concluido" ou "cancelado", enviar email para o cliente
      if (status !== agendamento.status && (status === "concluido" || status === "cancelado")) {
        try {
          const dataFormatada = dataAgendamento.toLocaleDateString("pt-BR")
          const horaInicioFormatada = horaInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

          const assunto = status === "concluido" ? "Agendamento Concluído" : "Agendamento Cancelado"

          const mensagem =
            status === "concluido" ? "Seu agendamento foi concluído com sucesso!" : "Seu agendamento foi cancelado."

          const emailHtml = `
            <h1>${assunto}</h1>
            <p>Olá ${cliente.usuario.nome},</p>
            <p>${mensagem}</p>
            <p><strong>Serviço:</strong> ${servico.nome}</p>
            <p><strong>Pet:</strong> ${pet.nome}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${horaInicioFormatada}</p>
            <p>Agradecemos a preferência!</p>
          `

          await sendEmail(cliente.usuario.email, assunto, emailHtml)
        } catch (error) {
          console.error("Erro ao enviar email de atualização:", error)
        }
      }
    }

    // Atualizar agendamento
    const agendamentoAtualizado = await prisma.agendamento.update({
      where: { id: Number(id) },
      data: updateData,
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
    })

    return res.json(agendamentoAtualizado)
  }

  /**
   * Excluir agendamento
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o agendamento existe
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: Number(id) },
      include: {
        cliente: {
          include: {
            usuario: true,
          },
        },
        pet: true,
        servico: true,
      },
    })

    if (!agendamento) {
      throw new AppError("Agendamento não encontrado", 404)
    }

    // Enviar email de cancelamento para o cliente
    try {
      const dataFormatada = agendamento.data.toLocaleDateString("pt-BR")
      const horaInicioFormatada = agendamento.hora_inicio.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      const emailHtml = `
        <h1>Agendamento Cancelado</h1>
        <p>Olá ${agendamento.cliente.usuario.nome},</p>
        <p>Seu agendamento foi cancelado.</p>
        <p><strong>Serviço:</strong> ${agendamento.servico.nome}</p>
        <p><strong>Pet:</strong> ${agendamento.pet.nome}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${horaInicioFormatada}</p>
        <p>Agradecemos a compreensão!</p>
      `

      await sendEmail(agendamento.cliente.usuario.email, "Agendamento Cancelado", emailHtml)
    } catch (error) {
      console.error("Erro ao enviar email de cancelamento:", error)
    }

    // Excluir agendamento
    await prisma.agendamento.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }
}

module.exports = new AgendamentoController()
