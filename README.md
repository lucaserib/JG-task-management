# Sistema de Gestão de Tarefas Colaborativo

Sistema de gerenciamento de tarefas com arquitetura de microserviços, autenticação JWT com reset de senha, controle de acesso granular, notificações real-time via WebSocket e cobertura de testes unitários.

## 📑 Índice

- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Setup e Instalação](#-setup-e-instalação)
- [Como Testar](#-como-testar)
- [Diferenciais Implementados](#-diferenciais-implementados)
- [Decisões Técnicas](#-decisões-técnicas)
- [Problemas Conhecidos](#-problemas-conhecidos)
- [Tempo de Desenvolvimento](#-tempo-de-desenvolvimento)
- [API Documentation](#-api-documentation)

---

## 🏗️ Arquitetura

Arquitetura de microserviços em monorepo com Turborepo:

```
┌──────────────────┐
│   Frontend       │  http://localhost:3000
│   (React)        │
└────────┬─────────┘
         │ HTTP + WebSocket
         ▼
┌──────────────────┐
│  API Gateway     │  http://localhost:3001
│  (NestJS)        │  Swagger: /api/docs
└────────┬─────────┘
         │ RabbitMQ
    ┌────┴────┬─────────────┬──────────────┐
    ▼         ▼             ▼              ▼
┌────────┐ ┌──────┐  ┌──────────┐   ┌──────────┐
│  Auth  │ │Tasks │  │Notifications│ │PostgreSQL│
│Service │ │Service│ │  Service    │ │ :5432    │
│ :3002  │ │ :3003│  │   :3004     │ └──────────┘
└────────┘ └──────┘  └──────────┘
```

**Serviços:**

- **API Gateway**: Ponto de entrada HTTP/WebSocket, validação JWT, rate limiting
- **Auth Service**: Autenticação, refresh tokens, reset de senha, gerenciamento de usuários
- **Tasks Service**: CRUD de tarefas, comentários, histórico, ACL granular
- **Notifications Service**: Consumidor de eventos RabbitMQ, notificações WebSocket
- **PostgreSQL**: Banco compartilhado com migrations TypeORM
- **RabbitMQ**: Message broker para comunicação assíncrona

---

## 🛠️ Stack Tecnológica

**Backend:**

- NestJS, TypeORM, PostgreSQL 14, RabbitMQ
- JWT + Passport, bcrypt
- Jest + @nestjs/testing (57 testes unitários)

**Frontend:**

- React 18 + Vite, TanStack Router
- shadcn/ui + Tailwind CSS
- Zustand + TanStack Query
- react-hook-form + zod
- socket.io-client

**DevOps:**

- Monorepo (Turborepo + npm workspaces)
- Docker + Docker Compose

---

## 🚀 Setup e Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- Docker + Docker Compose
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/lucaserib/JG-task-management.git
cd JG-task-management

# 2. Instale dependências
npm install

# 3. Inicie os containers
docker-compose up -d

# 4. Aguarde ~30-60s e execute as migrations
docker-compose exec auth-service npm run migration:run
docker-compose exec tasks-service npm run migration:run
docker-compose exec notifications-service npm run migration:run

# 5. Verifique os logs
docker-compose logs api-gateway
```

### Acessar

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs
- **RabbitMQ Admin**: http://localhost:15672 (admin/admin)

---

## 🧪 Como Testar

### 1. Registro e Login

**Via Interface:**

1. Acesse http://localhost:3000
2. Clique em "Sign up"
3. Preencha: username: `testuser`, email: `test@example.com`, password: `Test@1234`
4. Clique em "Create account"

**Via API:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "Test@1234"}'
```

### 2. Reset de Senha (Diferencial)

**Via Interface:**

1. Na tela de login, clique em "Forgot password?"
2. Digite o email: `test@example.com`
3. **Copie o token** que aparece na tela
4. Cole o token e digite nova senha: `NewPass@1234`
5. Faça login com a nova senha

**Via API:**

```bash
# Solicitar reset
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Usar token retornado
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_AQUI", "newPassword": "NewPass@1234"}'
```

### 3. CRUD de Tarefas

```bash
# Salvar o access_token do login
TOKEN="seu_token_aqui"

# Criar tarefa
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Tarefa Teste", "status": "TODO", "priority": "HIGH"}'

# Listar tarefas
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Atualizar tarefa
curl -X PUT http://localhost:3001/api/tasks/:id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

### 4. Controle de Acesso (ACL)

```bash
# Criar segundo usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "user2", "email": "user2@example.com", "password": "User2@1234"}'

# user2 tenta acessar tarefa do user1 → 403 Forbidden
curl -X GET http://localhost:3001/api/tasks/:id_task_user1 \
  -H "Authorization: Bearer $TOKEN_USER2"

# user1 atribui user2 → agora user2 pode VER (mas não editar/deletar)
curl -X PUT http://localhost:3001/api/tasks/:id \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"assigneeIds": ["user2_id"]}'
```

### 5. Notificações Real-Time

**Via Interface:**

1. Abra duas janelas do navegador
2. Faça login com user1 e user2
3. user1 cria tarefa e atribui ao user2
4. Veja a notificação aparecer instantaneamente no user2 (🔔)

### 6. Testes Unitários (Diferencial)

```bash
# Rodar todos os testes
npm run test:cov

# Resultado esperado:
# auth-service: 30 testes ✅
# tasks-service: 27 testes ✅
# Total: 57 testes (100% pass rate)

# Cobertura:
# auth.service.ts: 100%
# tasks.service.ts: 77.7%
```

### 7. Explorar Swagger

1. Acesse http://localhost:3001/api/docs
2. Clique em "Authorize" e cole o `access_token`
3. Teste todos os endpoints diretamente

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Limpar tudo (incluindo banco)
docker-compose down -v
```

---

## 🌟 Diferenciais Implementados

### 1. Reset de Senha com Token Seguro

**Implementação completa:**

- Token criptográfico (`crypto.randomBytes(32)`) com hash bcrypt
- Expiração de 1 hora
- One-time use (invalidado após reset)
- Validação de senha forte (min 8 chars, letras + números + especiais)
- UI completa no frontend (fluxo 2 etapas)

**Arquivos:**

- `apps/auth-service/src/auth/auth.service.ts` (forgotPassword, resetPassword)
- `apps/auth-service/migrations/1704315000000-AddPasswordResetFields.ts`
- `apps/web/src/presentation/components/features/ForgotPasswordDialog.tsx`

**Nota:** Em produção, o token seria enviado por email (SendGrid/AWS SES). Para o desafio, exibo o token na UI para facilitar testes.

### 2. Testes Unitários Modulares

**Cobertura:**

- **57 testes** (30 auth + 27 tasks)
- Estrutura modular em `__tests__/` directories
- Test helpers reutilizáveis (DRY principle)
- 100% pass rate

**Auth Service (30 testes):**

- `auth.service.authentication.spec.ts` - 8 testes (login/register/refresh)
- `auth.service.password-reset.spec.ts` - 9 testes (forgot/reset password)
- `auth.service.user-queries.spec.ts` - 8 testes (queries + segurança)

**Tasks Service (27 testes):**

- `tasks.service.access-control.spec.ts` - 10 testes (ACL granular)
- `tasks.service.crud.spec.ts` - 11 testes (CRUD + histórico + eventos)

**Decisão:** Foquei em testar lógica de negócio (services) ao invés de controllers, seguindo princípio 80/20.

---

## 📝 Decisões Técnicas

### 1. Monorepo com Turborepo

**Vantagens:**

- Compartilhamento de tipos (`@repo/types`) entre frontend/backend
- Build otimizado com cache inteligente
- DX: um único `npm install`, comandos centralizados

**Trade-offs:**

- Build inicial lento (~30s)
- Curva de aprendizado para desenvolvedores não familiarizados

### 2. Microserviços com RabbitMQ

**Por quê:**

- Separação de domínios (Auth, Tasks, Notifications independentes)
- Comunicação assíncrona (task criada → evento RabbitMQ → notificação)
- Resiliência (filas duráveis persistem mensagens em caso de queda)
- Escalabilidade horizontal

**Trade-offs:**

- Complexidade operacional (6 containers)
- Latência de rede (~30ms vs 10ms de monolito)
- Consistência eventual (notificações podem ter delay 1-2s)

**Problema enfrentado:** Mensagens RabbitMQ se perdiam durante restart.
**Solução:** Configurei filas como `durable: true` e mensagens com `persistent: true`.

### 3. PostgreSQL Compartilhado

**Por quê:**

- Simplicidade para MVP (setup, migrations)
- Transações ACID (criar tarefa + atribuir usuários + histórico é atômico)
- Joins nativos

**Trade-offs:**

- Acoplamento de dados entre serviços
- Violação do princípio "Database per Service"
- Em produção, migraria para bancos separados + Event Sourcing

### 4. Controle de Acesso Granular (ACL)

**Regras implementadas:**

- Usuário só vê tarefas que criou OU foi atribuído
- Apenas creator pode atualizar/deletar
- Creator E assignees podem comentar

**Problema enfrentado:** Inicialmente esqueci de validar acesso em `getComments` e `getHistory`.
**Solução:** Criei helper `validateTaskAccess()` reutilizado em todos os métodos + 10 testes de ACL.

**Trade-off:** Performance (queries com JOIN em task_assignees). Em escala, adicionaria cache Redis.

### 5. JWT com Refresh Token

**Implementação:**

- Access token (15 min, stateless)
- Refresh token (7 dias, armazenado no DB)
- Interceptor no frontend renova automaticamente quando expira

**Problema enfrentado:** Inicialmente só tinha access token. Quando expirava, usuário era deslogado abruptamente.
**Solução:** Implementei refresh token + interceptor automático.

**Limitação:** Access tokens não podem ser revogados (stateless). Melhoria futura: blacklist em Redis.

### 6. Sistema de Notificações Inteligente

**Lógica de filtro:**

- Usuário NÃO é notificado de suas próprias ações
- Creator + assignees são notificados quando OUTRO usuário altera/comenta
- Notificações persistidas no banco (histórico + lido/não lido)

**Maior dificuldade do projeto (1h30min de debug):**
Inicialmente TODAS as notificações eram enviadas, incluindo auto-notificações. Pior: notificações duplicavam porque tanto `tasks-service` quanto `notifications-service` publicavam eventos.

**Solução:**

1. Filtro em `EventsService` (tasks-service): só publica se `userId !== authorId`
2. Filtro em `NotificationsService`: valida novamente antes de persistir
3. Testes para garantir que auto-notificações nunca ocorrem

**Trade-off:** Duplicação de lógica de filtro em 2 serviços.

### 7. TypeORM com Migrations Versionadas

**Vantagens:**

- Integração nativa NestJS
- Type-safety (evita erros de schema em compile time)
- Migrations robustas versionadas

**Problema:** Migrations precisam ser executadas manualmente após `docker-compose up`.
**Por que não automatizei:** Em produção, migrations devem ser controladas (CI/CD executa antes do deploy). Auto-migrations podem causar downtime.

### 8. Validação em Camadas

1. **Frontend**: react-hook-form + zod (feedback imediato)
2. **API Gateway**: class-validator (segurança)
3. **Service**: Validações de negócio (ACL, etc)
4. **Database**: Constraints SQL (última linha de defesa)

**Trade-off:** Duplicação de regras (zod no frontend, class-validator no backend).

---

## 🐛 Problemas Conhecidos

### 1. Migrations Manuais

Após `docker-compose up`, é necessário executar migrations manualmente:

```bash
docker-compose exec auth-service npm run migration:run
docker-compose exec tasks-service npm run migration:run
docker-compose exec notifications-service npm run migration:run
```

**Soluções consideradas:**

- Script `init.sh` que aguarda Postgres healthy
- TypeORM `synchronize: true` (perigoso, pode dropar tabelas)
- Migrations no Dockerfile entrypoint

### 2. Falta de Revogação de Access Tokens

Access tokens JWT são stateless. Se vazar, fica válido por 15min.

**Solução futura:** Redis blacklist + endpoint `/logout`.

### 3. Cache de Usuários (N+1 Problem)

`TasksService.mapTaskToResponse()` chama `getUsersByIds()` via RPC para cada tarefa.
Listar 100 tarefas = 100 chamadas RPC (~2-5s de latência total).

**Solução futura:** Batch loading ou cache in-memory com TTL de 5min.

### 4. Paginação Offset-Based

Paginação atual (`page=1&size=10`) pode ter registros duplicados/omitidos se dados mudarem entre páginas.

**Solução futura:** Cursor-based pagination.

### 5. Falta de Observabilidade

Sem trace IDs, métricas (P50/P95/P99), ou health checks de dependências.

**Solução futura:** OpenTelemetry + exportar para Jaeger/Zipkin.

### 6. Senha PostgreSQL Hardcoded

`docker-compose.yml` tem senha em texto plano.

**Solução:** `.env` file + `.env.example`.

### Melhorias Futuras

**Funcionalidades:**

- Anexos de arquivos (S3/MinIO)
- Subtarefas, tags/labels
- Menções (`@username`)
- Busca full-text (Elasticsearch)
- 2FA (TOTP)

**Arquitetura:**

- Event Sourcing + CQRS
- Feature flags
- API versioning

**DevOps:**

- CI/CD (GitHub Actions)
- Kubernetes + Helm
- Multi-stage Docker builds

**Performance:**

- Redis cache
- Database indexing
- GraphQL (evitar over-fetching)

**Segurança:**

- HTTPS obrigatório
- Helmet.js
- Refresh token rotation

---

## ⏱️ Tempo de Desenvolvimento

| Fase                               | Tempo        | Observações                                           |
| ---------------------------------- | ------------ | ----------------------------------------------------- |
| Setup do Monorepo                  | 45 min       | Turborepo + workspaces + estrutura inicial            |
| Packages Compartilhados            | 30 min       | @repo/types, @repo/utils, configs ESLint/TypeScript   |
| API Gateway                        | 2h           | HTTP endpoints, WebSocket, Swagger, rate limiting     |
| Auth Service (base)                | 1h 30min     | JWT, bcrypt, refresh tokens, migrations               |
| **Reset de Senha (diferencial)**   | **1h 30min** | **Token seguro, hash, expiração, UI completa**        |
| Tasks Service (base)               | 3h           | CRUD, assignees, comments, histórico                  |
| **Controle de Acesso (ACL)**       | **2h 30min** | **ACL granular, validações, testes**                  |
| Notifications Service              | 1h 30min     | Consumidor RabbitMQ, persistência, WebSocket          |
| **Fix Notificações (debug)**       | **1h 30min** | **Problema: auto-notificações + duplicação**          |
| Docker & Docker Compose            | 1h           | Dockerfiles, orquestração de 7 containers             |
| Frontend (Web)                     | 3h 30min     | TanStack Router, shadcn/ui, Zustand, WebSocket client |
| **Testes Unitários (diferencial)** | **3h**       | **57 testes modulares, 100% pass rate, test helpers** |
| Health Checks & Logging            | 1h           | Winston, health endpoints, error handling             |
| UI Edit/Delete + Validações        | 1h 30min     | Modais de edição/exclusão, validações                 |
| Documentação & README              | 2h 30min     | Arquitetura, trade-offs, instruções completas         |
| **TOTAL**                          | **~27h**     | **Tempo real ao longo de 1 semana**                   |

### Distribuição por Área

- Backend (NestJS + Microserviços): ~12h (44%)
- Frontend (React): ~5h (19%)
- Testes e Qualidade: ~3h (11%)
- Infraestrutura (Docker, RabbitMQ): ~2h 30min (9%)
- Segurança & ACL: ~4h (15%)
- Documentação: ~2h 30min (9%)

### Destaques

**Maior desafio:** Sistema de notificações (1h30min debuggando duplicação + auto-notificações).
Solução: filtros em 2 camadas (EventsService + NotificationsService).

**Segunda maior dificuldade:** ACL granular (2h30min).
Solução: helper `validateTaskAccess()` + 10 testes de ACL.

**Maior satisfação:** Ver notificações real-time funcionando end-to-end via WebSocket.

**Aprendizados:**

- Testes valem a pena (pegaram 3 bugs durante refatoração de ACL)
- Documentação é investimento (economiza horas de suporte)
- Trade-offs são inevitáveis (não existe solução perfeita)

---

## 📚 API Documentation

### Swagger/OpenAPI

**http://localhost:3001/api/docs**

### Endpoints Principais

**Autenticação:**

```
POST   /api/auth/register           # Registrar usuário
POST   /api/auth/login              # Login
POST   /api/auth/refresh            # Renovar access token
POST   /api/auth/forgot-password    # Solicitar reset (diferencial)
POST   /api/auth/reset-password     # Resetar senha (diferencial)
```

**Tarefas:**

```
GET    /api/tasks                   # Listar (paginação + filtros)
POST   /api/tasks                   # Criar
GET    /api/tasks/:id               # Obter
PUT    /api/tasks/:id               # Atualizar (apenas creator)
DELETE /api/tasks/:id               # Deletar (apenas creator)
GET    /api/tasks/:id/history       # Histórico de alterações
```

**Filtros:** status, priority, assigneeId, page, size

**Comentários:**

```
POST   /api/tasks/:id/comments      # Criar (creator ou assignee)
GET    /api/tasks/:id/comments      # Listar
DELETE /api/tasks/comments/:id      # Deletar (apenas autor)
```

**Notificações:**

```
GET    /api/notifications                  # Listar
GET    /api/notifications/unread-count     # Contar não lidas
PATCH  /api/notifications/:id/read         # Marcar como lida
PATCH  /api/notifications/read-all         # Marcar todas
DELETE /api/notifications/:id              # Deletar
```

### WebSocket Events

```javascript
const socket = io('http://localhost:3001/notifications');

socket.on('connect', () => socket.emit('register', userId));
socket.on('task:created', (data) => { ... });
socket.on('task:updated', (data) => { ... });
socket.on('task:deleted', (data) => { ... });
socket.on('comment:new', (data) => { ... });
```

### DTOs

**CreateTaskDto:**

```typescript
{
  title: string;              // Obrigatório
  description?: string;
  status?: TaskStatus;        // TODO | IN_PROGRESS | DONE | CANCELLED
  priority?: TaskPriority;    // LOW | MEDIUM | HIGH | URGENT
  dueDate?: Date;
  assigneeIds?: string[];
}
```

**RegisterDto:**

```typescript
{
  username: string; // Min 3 caracteres
  email: string; // Email válido
  password: string; // Min 8 chars, letras + números + especiais
}
```

---

## 📦 Estrutura do Projeto

```
JG-task-management/
├── apps/
│   ├── api-gateway/              # Gateway HTTP + WebSocket
│   ├── auth-service/             # Autenticação + reset de senha
│   │   └── src/auth/__tests__/   # 30 testes unitários
│   ├── tasks-service/            # CRUD + ACL + histórico
│   │   └── src/tasks/__tests__/  # 27 testes unitários
│   ├── notifications-service/    # Eventos + WebSocket
│   └── web/                      # Frontend React
├── packages/
│   ├── types/                    # Tipos compartilhados
│   ├── utils/                    # Utilitários
│   ├── eslint-config/
│   └── tsconfig/
├── docker-compose.yml
├── turbo.json
└── TESTING.md
```

---
