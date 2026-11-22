# Sistema de Gestão de Pacientes

Aplicação web completa (*full-stack*) para gerenciamento de pacientes de uma clínica, com autenticação via **JWT (JSON Web Token)** e operações completas de **CRUD** (criação, leitura, atualização e exclusão).

---

## Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** (API REST)
- **JSON Web Token (`jsonwebtoken`)** para autenticação
- **Bcrypt (`bcryptjs`)** para hash de senhas
- **CORS** para integração com o frontend
- **Jest** + **Supertest** para testes automatizados

### Frontend
- **Angular 21** (TypeScript, Standalone Components, Signals, Reactive Forms)
- **Vitest** (via Angular CLI) para testes unitários e de integração

---

## Estrutura do Projeto

```text
sistema-pacientes/
├── backend/                     # API REST em Node.js + Express
│   ├── paciente.js              # Classe Paciente (validações, formatação e cálculo de idade)
│   ├── server.js                # Servidor, rotas de login e CRUD protegido por JWT
│   └── *.test.js                # Testes automatizados do backend
├── frontend/                    # Aplicação web em Angular
│   └── src/app/
│       ├── models/              # Classe Paciente (getters, setters e cálculo de idade)
│       ├── services/            # Comunicação HTTP (AuthService e PacienteService)
│       ├── interceptors/        # Envio automático do token Bearer e tratamento de erro 401
│       ├── guards/              # Proteção das rotas autenticadas (authGuard)
│       └── pages/               # Telas de Login e Gestão de Pacientes
└── README.md
```

---

## Pré-requisitos

- **Node.js** v20 ou superior
- **npm** (instalado junto com o Node.js)
- **Angular CLI** (`npm install -g @angular/cli`) — opcional se utilizar `npx ng`

---

## Como Executar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/jullymiran/sistema-pacientes.git
cd sistema-pacientes
```

### 2. Iniciar o Backend (porta `3000`)
O servidor exige a variável de ambiente `JWT_SECRET` configurada antes de iniciar.

```bash
cd backend
npm install
```

Inicie o servidor conforme o seu terminal:

- **Windows (PowerShell):**
  ```powershell
  $env:JWT_SECRET="chave-secreta-local"; node server.js
  ```
- **Windows (CMD):**
  ```cmd
  set JWT_SECRET=chave-secreta-local && node server.js
  ```
- **Linux / macOS:**
  ```bash
  JWT_SECRET="chave-secreta-local" node server.js
  ```

A API ficará disponível em `http://localhost:3000`.

### 3. Iniciar o Frontend (porta `4200`)
Em um **segundo terminal**, a partir da raiz do projeto:

```bash
cd frontend
npm install
ng serve
```

Acesse a aplicação no navegador em **`http://localhost:4200`**.

---

## Credenciais de Acesso (Testes)

Usuários pré-cadastrados atualmente em `backend/server.js`:

| Usuário | CPF | Senha |
| :--- | :--- | :--- |
| Ana | `09877676761` | `ana123` |
| João | `12345678910` | `jota002` |

---

## Rotas da API

| Método | Rota | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/login` | Pública | Autentica com `cpf` e `senha` e retorna o token JWT |
| `GET` | `/pacientes` | Bearer Token | Lista todos os pacientes cadastrados |
| `GET` | `/pacientes/:id` | Bearer Token | Busca um paciente específico pelo ID |
| `POST` | `/pacientes` | Bearer Token | Cadastra um novo paciente |
| `PUT` | `/pacientes/:id` | Bearer Token | Atualiza os dados de um paciente existente |
| `DELETE` | `/pacientes/:id` | Bearer Token | Remove um paciente pelo ID |

### Campos do Paciente
- `id` (numérico, gerado automaticamente no cadastro)
- `nome` (obrigatório)
- `cpf` (obrigatório)
- `dataNascimento` (obrigatório, formato `YYYY-MM-DD`)
- `telefone` (obrigatório)
- `plano` (obrigatório)
- `idade` (calculada dinamicamente a partir da data de nascimento)

---

## Testes Automatizados

### Frontend (Testes Unitários e de Integração)
Cobre o modelo `Paciente`, serviços HTTP (`AuthService` e `PacienteService`), interceptor JWT, guarda de rotas e o fluxo completo das telas de Login e Pacientes (24 testes em 8 arquivos):

```bash
cd frontend
ng test --watch=false
```

### Backend
```bash
cd backend
npm test
```

---

## Fluxo de Segurança no Frontend

1. Ao acessar `/pacientes` sem estar autenticado, o `authGuard` redireciona automaticamente para `/login`.
2. Ao enviar CPF e senha válidos, o `AuthService` armazena o token JWT no `localStorage`.
3. O `authInterceptor` anexa automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as requisições protegidas.
4. Caso a API retorne status `401` (token ausente, inválido ou expirado), a sessão é encerrada e o usuário volta para `/login`.
5. Ao clicar em **Sair**, o token é removido do `localStorage` e o acesso às rotas protegidas volta a ser bloqueado.

---

## Integrantes do Grupo

- **Frontend (Angular):** *(seu nome aqui)*
- **Backend (Node.js / Express):** *Julia Miranda Santos e Yuri Oliveira Ferreira*
