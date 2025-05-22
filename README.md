# Petshop ERP - Backend

Backend para sistema de gerenciamento de Petshop (ERP) desenvolvido com Node.js, Express e Prisma.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **MySQL**: Sistema de gerenciamento de banco de dados relacional
- **Prisma**: ORM para interação com banco de dados
- **JWT**: Biblioteca para autenticação com tokens
- **Bcrypt**: Biblioteca para hash de senhas
- **Multer**: Middleware para upload de arquivos
- **Nodemailer**: Biblioteca para envio de emails
- **Swagger**: Documentação da API

## Requisitos

- Node.js 18+
- MySQL 8.0+
- Docker e Docker Compose (opcional)

## Configuração

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/seu-usuario/petshop-erp-backend.git
cd petshop-erp-backend
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env
\`\`\`
Edite o arquivo `.env` com suas configurações.

4. Execute as migrações do banco de dados:
\`\`\`bash
npm run migrate:dev
\`\`\`

5. Execute o seed para popular o banco com dados iniciais:
\`\`\`bash
npm run seed
\`\`\`

## Executando o Projeto

### Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

### Produção

\`\`\`bash
npm start
\`\`\`

### Docker

\`\`\`bash
docker-compose up -d
\`\`\`

## Testes

### Executar testes

\`\`\`bash
npm test
\`\`\`

### Cobertura de testes

\`\`\`bash
npm run test:coverage
\`\`\`

## Documentação da API

A documentação da API está disponível em:

\`\`\`
http://localhost:3000/api-docs
\`\`\`

## Estrutura do Projeto

\`\`\`
├── prisma/                  # Configuração do Prisma e migrações
├── src/
│   ├── config/              # Configurações (banco de dados, email, etc.)
│   ├── controllers/         # Controladores da API
│   ├── middlewares/         # Middlewares do Express
│   ├── repositories/        # Camada de acesso a dados
│   ├── routes/              # Rotas da API
│   ├── services/            # Lógica de negócios
│   ├── utils/               # Utilitários
│   ├── validations/         # Esquemas de validação
│   ├── app.js               # Configuração do Express
│   └── server.js            # Ponto de entrada da aplicação
├── tests/                   # Testes automatizados
├── uploads/                 # Diretório para uploads de arquivos
├── .env.example             # Exemplo de variáveis de ambiente
├── .eslintrc.js             # Configuração do ESLint
├── .prettierrc              # Configuração do Prettier
├── docker-compose.yml       # Configuração do Docker Compose
├── Dockerfile               # Configuração do Docker
├── jest.config.js           # Configuração do Jest
└── package.json             # Dependências e scripts
\`\`\`

## Ambientes

O projeto suporta dois ambientes:

- **Desenvolvimento**: Configurado para depuração e desenvolvimento local
- **Produção**: Otimizado para desempenho e segurança

## Licença

Este projeto está licenciado sob a licença MIT.
