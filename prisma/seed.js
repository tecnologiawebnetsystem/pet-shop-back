const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seed...")

  // Criar usuário admin
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@petshop.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@petshop.com",
      senha: adminPassword,
      tipo: "admin",
      status: "ativo",
      data_cadastro: new Date(),
    },
  })
  console.log("Usuário admin criado:", admin.id)

  // Criar usuário funcionário
  const funcionarioPassword = await bcrypt.hash("func123", 10)
  const funcionarioUser = await prisma.usuario.upsert({
    where: { email: "funcionario@petshop.com" },
    update: {},
    create: {
      nome: "Funcionário Teste",
      email: "funcionario@petshop.com",
      senha: funcionarioPassword,
      tipo: "funcionario",
      status: "ativo",
      data_cadastro: new Date(),
    },
  })

  // Criar funcionário
  const funcionario = await prisma.funcionario.upsert({
    where: { usuario_id: funcionarioUser.id },
    update: {},
    create: {
      usuario_id: funcionarioUser.id,
      cargo: "Atendente",
      salario: 2500.0,
      data_contratacao: new Date("2022-01-15"),
      documento: "12345678900",
      especialidade: "Banho e Tosa",
    },
  })
  console.log("Funcionário criado:", funcionario.id)

  // Criar usuário cliente
  const clientePassword = await bcrypt.hash("cliente123", 10)
  const clienteUser = await prisma.usuario.upsert({
    where: { email: "cliente@exemplo.com" },
    update: {},
    create: {
      nome: "Cliente Teste",
      email: "cliente@exemplo.com",
      senha: clientePassword,
      tipo: "cliente",
      status: "ativo",
      data_cadastro: new Date(),
    },
  })

  // Criar cliente
  const cliente = await prisma.cliente.upsert({
    where: { usuario_id: clienteUser.id },
    update: {},
    create: {
      usuario_id: clienteUser.id,
      cpf: "12345678901",
      endereco: "Rua Exemplo, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      data_nascimento: new Date("1990-01-01"),
    },
  })
  console.log("Cliente criado:", cliente.id)

  // Criar pet
  const pet = await prisma.pet.create({
    data: {
      cliente_id: cliente.id,
      nome: "Rex",
      especie: "Cachorro",
      raca: "Labrador",
      data_nascimento: new Date("2020-03-15"),
      peso: 25.5,
      sexo: "macho",
      cor: "Caramelo",
    },
  })
  console.log("Pet criado:", pet.id)

  // Criar categorias de serviço
  const categoriaServico = await prisma.categoriaServico.create({
    data: {
      nome: "Estética",
      descricao: "Serviços de estética e beleza animal",
    },
  })
  console.log("Categoria de serviço criada:", categoriaServico.id)

  // Criar serviços
  const servico = await prisma.servico.create({
    data: {
      nome: "Banho Completo",
      descricao: "Banho com shampoo especial, secagem e escovação",
      preco: 60.0,
      duracao: 60,
      categoria_id: categoriaServico.id,
    },
  })
  console.log("Serviço criado:", servico.id)

  // Criar categorias de produto
  const categoriaProduto = await prisma.categoriaProduto.create({
    data: {
      nome: "Alimentação",
      descricao: "Produtos para alimentação animal",
    },
  })
  console.log("Categoria de produto criada:", categoriaProduto.id)

  // Criar fornecedor
  const fornecedor = await prisma.fornecedor.create({
    data: {
      nome: "Fornecedor Exemplo",
      cnpj: "12.345.678/0001-90",
      telefone: "(11) 1234-5678",
      email: "contato@fornecedor.com",
      endereco: "Rua dos Fornecedores, 100",
      cidade: "São Paulo",
      estado: "SP",
      cep: "04567-890",
      contato: "João Silva",
    },
  })
  console.log("Fornecedor criado:", fornecedor.id)

  // Criar produtos
  const produto = await prisma.produto.create({
    data: {
      nome: "Ração Premium",
      descricao: "Ração premium para cães adultos",
      preco: 89.9,
      preco_custo: 65.0,
      estoque: 50,
      estoque_minimo: 10,
      categoria_id: categoriaProduto.id,
      fornecedor_id: fornecedor.id,
      codigo_barras: "7891234567890",
    },
  })
  console.log("Produto criado:", produto.id)

  // Criar agendamento
  const agendamento = await prisma.agendamento.create({
    data: {
      cliente_id: cliente.id,
      pet_id: pet.id,
      servico_id: servico.id,
      funcionario_id: funcionario.id,
      data: new Date("2023-06-15"),
      hora_inicio: new Date("2023-06-15T14:00:00"),
      hora_fim: new Date("2023-06-15T15:00:00"),
      status: "agendado",
      observacoes: "Cliente solicitou cuidado especial com as orelhas",
    },
  })
  console.log("Agendamento criado:", agendamento.id)

  // Criar venda
  const venda = await prisma.venda.create({
    data: {
      cliente_id: cliente.id,
      funcionario_id: funcionario.id,
      data: new Date(),
      valor_total: 89.9,
      forma_pagamento: "cartao_credito",
      status: "concluida",
    },
  })
  console.log("Venda criada:", venda.id)

  // Criar item de venda
  const itemVenda = await prisma.itemVenda.create({
    data: {
      venda_id: venda.id,
      produto_id: produto.id,
      quantidade: 1,
      valor_unitario: 89.9,
      valor_total: 89.9,
    },
  })
  console.log("Item de venda criado:", itemVenda.id)

  // Criar tarefa
  const tarefa = await prisma.tarefa.create({
    data: {
      funcionario_id: funcionario.id,
      titulo: "Organizar estoque",
      descricao: "Verificar produtos com validade próxima e reorganizar prateleiras",
      data: new Date("2023-06-20"),
      hora: new Date("2023-06-20T09:00:00"),
      prioridade: "media",
      status: "pendente",
    },
  })
  console.log("Tarefa criada:", tarefa.id)

  console.log("Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
