const prisma = require("../config/database")
const AppError = require("../utils/AppError")
const path = require("path")
const fs = require("fs")

class PetController {
  /**
   * Listar todos os pets
   */
  async findAll(req, res) {
    const { nome, especie, raca, cliente_id, page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    // Construir filtro
    const where = {}

    if (nome) {
      where.nome = {
        contains: nome,
      }
    }

    if (especie) {
      where.especie = {
        contains: especie,
      }
    }

    if (raca) {
      where.raca = {
        contains: raca,
      }
    }

    if (cliente_id) {
      where.cliente_id = Number(cliente_id)
    }

    // Buscar pets com paginação
    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
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
        },
        skip,
        take: Number(limit),
        orderBy: { nome: "asc" },
      }),
      prisma.pet.count({ where }),
    ])

    return res.json({
      pets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Buscar pet por ID
   */
  async findById(req, res) {
    const { id } = req.params

    const pet = await prisma.pet.findUnique({
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
      },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    return res.json(pet)
  }

  /**
   * Criar novo pet
   */
  async create(req, res) {
    const { cliente_id, nome, especie, raca, data_nascimento, peso, sexo, cor, observacoes } = req.body

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(cliente_id) },
    })

    if (!cliente) {
      throw new AppError("Cliente não encontrado", 404)
    }

    // Criar pet
    const pet = await prisma.pet.create({
      data: {
        cliente_id: Number(cliente_id),
        nome,
        especie,
        raca,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null,
        peso: peso ? Number(peso) : null,
        sexo,
        cor,
        observacoes,
      },
    })

    return res.status(201).json(pet)
  }

  /**
   * Atualizar pet
   */
  async update(req, res) {
    const { id } = req.params
    const { cliente_id, nome, especie, raca, data_nascimento, peso, sexo, cor, observacoes } = req.body

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: { id: Number(id) },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    // Verificar se o cliente existe, se fornecido
    if (cliente_id) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(cliente_id) },
      })

      if (!cliente) {
        throw new AppError("Cliente não encontrado", 404)
      }
    }

    // Atualizar pet
    const petAtualizado = await prisma.pet.update({
      where: { id: Number(id) },
      data: {
        cliente_id: cliente_id ? Number(cliente_id) : undefined,
        nome,
        especie,
        raca,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        peso: peso ? Number(peso) : undefined,
        sexo,
        cor,
        observacoes,
      },
    })

    return res.json(petAtualizado)
  }

  /**
   * Excluir pet
   */
  async delete(req, res) {
    const { id } = req.params

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: { id: Number(id) },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    // Se o pet tiver foto, excluir o arquivo
    if (pet.foto) {
      const fotoPath = path.resolve(process.env.UPLOAD_FOLDER, "pets", pet.foto)
      try {
        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath)
        }
      } catch (error) {
        console.error("Erro ao excluir foto do pet:", error)
      }
    }

    // Excluir pet
    await prisma.pet.delete({
      where: { id: Number(id) },
    })

    return res.status(204).send()
  }

  /**
   * Upload de foto do pet
   */
  async uploadFoto(req, res) {
    const { id } = req.params
    const { file } = req

    if (!file) {
      throw new AppError("Nenhum arquivo enviado", 400)
    }

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: { id: Number(id) },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    // Se o pet já tiver foto, excluir o arquivo anterior
    if (pet.foto) {
      const fotoAnteriorPath = path.resolve(process.env.UPLOAD_FOLDER, "pets", pet.foto)
      try {
        if (fs.existsSync(fotoAnteriorPath)) {
          fs.unlinkSync(fotoAnteriorPath)
        }
      } catch (error) {
        console.error("Erro ao excluir foto anterior do pet:", error)
      }
    }

    // Atualizar pet com a nova foto
    const petAtualizado = await prisma.pet.update({
      where: { id: Number(id) },
      data: {
        foto: file.filename,
      },
    })

    return res.json({
      message: "Foto atualizada com sucesso",
      pet: petAtualizado,
    })
  }

  /**
   * Listar agendamentos do pet
   */
  async findAgendamentos(req, res) {
    const { id } = req.params
    const { status } = req.query

    // Verificar se o pet existe
    const pet = await prisma.pet.findUnique({
      where: { id: Number(id) },
    })

    if (!pet) {
      throw new AppError("Pet não encontrado", 404)
    }

    // Construir filtro
    const where = { pet_id: Number(id) }
    if (status) where.status = status

    // Buscar agendamentos do pet
    const agendamentos = await prisma.agendamento.findMany({
      where,
      include: {
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
}

module.exports = new PetController()
