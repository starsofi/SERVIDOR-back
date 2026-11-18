# Sistema de Gestão de Ordens de Serviço — A.S.A.I. Manutenções

Aplicação web desenvolvida para o gerenciamento interno de ordens de serviço, técnicos, clientes e equipamentos da A.S.A.I. Manutenções, contando também com área pública para registro de solicitações pelos clientes.

## Tecnologias Utilizadas

* **Front-end:** HTML5, CSS3, JavaScript
* **Back-end:** Node.js, Express
* **Banco de Dados:** SQLite (`node:sqlite`)

---

## Estrutura de Pastas

```text
├── SERV/
│   └── banco.db              # Banco de dados SQLite
└── SERVID/
    ├── backend/
    │   └── server.js         # Servidor Express e rotas da API
    └── public/
        ├── CSS/              # Folhas de estilo
        ├── fotos/            # Imagens e ícones
        ├── index.html        # Página inicial / Painel operacional
        ├── login.html        # Login do cliente
        ├── criar.html        # Criação de conta do cliente
        └── cadastro.html     # Registro de solicitação de serviço
Como Executar o Projeto
Certifique-se de ter o Node.js (versão 22 ou superior) instalado.

Abra o terminal na pasta SERVID/backend e instale as dependências:

Bash
npm install express
Inicie o servidor:

Bash
node server.js
Acesse no navegador:

Sistema: http://localhost:3000

Portal do Cliente: http://localhost:3000/login.html

Estrutura do Banco de Dados (banco.db)
usuarios: Usuários administrativos com acesso restrito ao painel operacional (id, nome, cpf, senha).

clientes: Clientes registrados no painel operacional (id, nome, email, telefone).

tecnicos: Técnicos responsáveis pelos atendimentos (id, nome, especialidade, email).

equipamentos: Equipamentos vinculados aos clientes (id, nome, modelo, cliente_id).

ordens_servico: Ordens de serviço gerenciadas pela equipe (id, cliente_id, tecnico_id, equipamento_id, descricao, status, data_abertura).

registros_clientes: Tabela reservada para contas e solicitações enviadas pelo site público (id, nome, email, cpf, telefone, senha, equipamento, modelo, problema, data_envio).

Documentação da API
URL Base: http://localhost:3000

Formato de Dados: JSON (Content-Type: application/json)

1. Área Pública (Portal do Cliente)
Criar Conta do Cliente
Rota: POST /api/site/criar-conta

Corpo (JSON):

JSON
{
  "nome": "Julia Silva",
  "email": "julia@gmail.com",
  "cpf": "222.333.444-55",
  "telefone": "11 987766543",
  "senha": "1234"
}
Respostas:

200 OK: {"ok": true}

400 Bad Request: {"erro": "Preencha todos os campos!"} ou {"erro": "Este e-mail já possui cadastro!"}

Login do Cliente
Rota: POST /api/site/login

Corpo (JSON):

JSON
{
  "email": "julia@gmail.com",
  "senha": "1234"
}
Respostas:

200 OK: {"ok": true, "cliente": {"id": 1, "nome": "Julia Silva", "email": "julia@gmail.com", "telefone": "11 987766543"}}

401 Unauthorized: {"erro": "E-mail ou senha incorretos!"}

Registrar Solicitação de Serviço
Rota: POST /api/site/registrar-pedido

Corpo (JSON):

JSON
{
  "nome": "Julia Silva",
  "email": "julia@gmail.com",
  "telefone": "11 987766543",
  "equipamento": "Notebook",
  "modelo": "MacBook Pro 13",
  "problema": "Não liga após carregar durante a noite."
}
Respostas:

200 OK: {"ok": true, "protocolo": 1}

400 Bad Request: {"erro": "Preencha todos os campos!"}

2. Acesso Restrito (Painel Operacional)
Autenticação Administrativa
POST /api/login

Corpo: {"nome": "Sofia Gonçalves", "cpf": "444.444.444-44", "senha": "senha4"}

Respostas: 200 OK {"ok": true, "usuario": {...}} | 401 Unauthorized {"erro": "Nome, CPF ou senha incorretos!"}

GET /api/usuarios

Resposta (200 OK): Lista de usuários autorizados (id, nome, cpf).

Clientes (CRUD)
GET /api/clientes — Retorna todos os clientes cadastrados (200 OK).

POST /api/clientes — Cadastra um cliente. Corpo: {"nome", "email", "telefone"}. Resposta: 200 OK {"ok": true} ou 400 Bad Request.

DELETE /api/clientes/:id — Remove um cliente pelo ID (200 OK).

Técnicos (CRUD)
GET /api/tecnicos — Retorna todos os técnicos cadastrados (200 OK).

POST /api/tecnicos — Cadastra um técnico. Corpo: {"nome", "especialidade", "email"}. Resposta: 200 OK {"ok": true} ou 400 Bad Request.

DELETE /api/tecnicos/:id — Remove um técnico pelo ID (200 OK).

Equipamentos (CRUD)
GET /api/equipamentos — Lista todos os equipamentos com o nome do proprietário (200 OK).

POST /api/equipamentos — Cadastra um equipamento. Corpo: {"nome", "modelo", "cliente_id"}. Resposta: 200 OK {"ok": true} ou 400 Bad Request.

DELETE /api/equipamentos/:id — Remove um equipamento pelo ID (200 OK).

Ordens de Serviço (CRUD e Status)
GET /api/ordens_servico — Lista todas as ordens de serviço com cliente, técnico e equipamento (200 OK).

POST /api/ordens_servico — Abre uma nova OS. Corpo: {"cliente_id", "tecnico_id", "equipamento_id", "descricao", "status"}. Resposta: 200 OK {"ok": true} ou 400 Bad Request.

PUT /api/ordens_servico/:id/status — Atualiza o status da OS (Pendente, Em andamento, Concluído). Corpo: {"status": "Concluído"}. Resposta: 200 OK {"ok": true}.

DELETE /api/ordens_servico/:id — Exclui uma ordem de serviço pelo ID (200 OK).


Depois de criar o arquivo `README.md` e salvar, basta rodar no terminal da pasta do repositório para enviar tudo para o GitHub:

```bash
git add .
git commit -m "Entrega Sprint 2 - API, banco SQLite e documentacao"
git push