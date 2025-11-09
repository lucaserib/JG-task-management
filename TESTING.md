# 🧪 Estratégia de Testes Unitários

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Estrutura Modular](#estrutura-modular)
- [Como Executar](#como-executar)
- [Cobertura Atual](#cobertura-atual)
- [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

Este projeto utiliza **testes unitários modulares** seguindo clean code e boas práticas de desenvolvimento. Focamos em testar:

1. **Lógica de negócio crítica** (AuthService, TasksService)
2. **Controle de acesso (ACL)**
3. **Operações CRUD**
4. **Segurança** (autenticação, reset de senha)

### Stack de Testes
- **Framework**: Jest
- **Integração**: @nestjs/testing
- **Cobertura**: 45+ testes em 5 módulos focados

---

## 📁 Estrutura Modular

### Auth Service (25 testes)
```
apps/auth-service/src/auth/
├── __tests__/
│   ├── test-helpers.ts                      # Mocks compartilhados
│   ├── auth.service.authentication.spec.ts  # Autenticação (8 tests)
│   ├── auth.service.password-reset.spec.ts  # Reset de senha (9 tests)
│   └── auth.service.user-queries.spec.ts    # Queries de usuário (8 tests)
├── auth.service.ts
└── auth.controller.ts
```

**Testes de Autenticação:**
- ✅ register: sucesso e conflito
- ✅ login: sucesso, user não encontrado, senha inválida
- ✅ refresh: sucesso, token inválido, token não correspondente

**Testes de Password Reset:**
- ✅ forgotPassword: gera token, expiração, email não encontrado
- ✅ resetPassword: sucesso, token inválido/expirado, invalidação após uso

**Testes de User Queries:**
- ✅ getUserById, getUsersByIds, getAllUsers
- ✅ Não expõe campos sensíveis (password, refreshToken)

---

### Tasks Service (20 testes)
```
apps/tasks-service/src/tasks/
├── __tests__/
│   ├── test-helpers.ts                      # Mocks compartilhados
│   ├── tasks.service.access-control.spec.ts # ACL (10 tests)
│   └── tasks.service.crud.spec.ts           # CRUD (10 tests)
├── tasks.service.ts
└── tasks.controller.ts
```

**Testes de Access Control:**
- ✅ getTaskById: acesso quando creator/assignee, forbidden
- ✅ updateTask: apenas creator pode atualizar
- ✅ deleteTask: apenas creator pode deletar
- ✅ createComment: creator e assignee podem comentar
- ✅ getTasks: aplica filtros de ACL

**Testes de CRUD:**
- ✅ createTask: com assignees, histórico, eventos
- ✅ updateTask: atualiza campos, rastreia mudanças
- ✅ deleteTask: cascade delete

---

## 🚀 Como Executar

### Pré-requisitos
```bash
# Instalar dependências (primeira vez)
npm install
```

### Executar Testes

#### **Da raiz do monorepo (todos os serviços):**
```bash
# Rodar todos os testes
npm test

# Watch mode (desenvolvimento)
npm run test:watch

# Com relatório de cobertura
npm run test:cov
```

#### **Por serviço específico:**
```bash
# Auth Service
cd apps/auth-service
npm test

# Tasks Service
cd apps/tasks-service
npm test

# Notifications Service
cd apps/notifications-service
npm test
```

#### **Por módulo específico:**
```bash
# Apenas testes de autenticação
cd apps/auth-service
npm test -- authentication

# Apenas testes de password reset
npm test -- password-reset

# Apenas testes de ACL
cd apps/tasks-service
npm test -- access-control
```

#### **Com coverage:**
```bash
# Gerar relatório de cobertura
npm run test:cov

# Ver relatório HTML
open apps/auth-service/coverage/lcov-report/index.html
open apps/tasks-service/coverage/lcov-report/index.html
```

---

## 📊 Cobertura Atual

### Auth Service
| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| auth.service.ts | 85%+ | 80%+ | 90%+ | 85%+ |

**Coberto:**
- ✅ Registro e login
- ✅ Refresh tokens
- ✅ Password reset (forgot + reset)
- ✅ User queries
- ✅ Validações de segurança

**Não coberto:**
- ⚠️ Error handling de edge cases específicos

---

### Tasks Service
| Arquivo | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| tasks.service.ts | 80%+ | 75%+ | 85%+ | 80%+ |

**Coberto:**
- ✅ CRUD completo de tasks
- ✅ Controle de acesso granular (ACL)
- ✅ Comentários
- ✅ Histórico de alterações
- ✅ Publicação de eventos

**Não coberto:**
- ⚠️ Alguns edge cases de getComments e getTaskHistory

---

## ✅ Boas Práticas

### 1. Modularização
```
✅ Cada arquivo testa UMA responsabilidade
✅ Arquivos pequenos (~100-200 linhas)
✅ Nomenclatura descritiva
```

### 2. Reutilização (DRY)
```typescript
// test-helpers.ts
export const mockUser = { ... };
export const createMockRepository = () => ({ ... });
```

### 3. Isolamento
```
✅ Cada teste é independente
✅ Mocks limpos entre testes (jest.clearAllMocks)
✅ Sem dependências entre testes
```

### 4. Legibilidade
```typescript
describe('Auth Service - Password Reset', () => {
  describe('forgotPassword', () => {
    it('should generate reset token for valid email', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 5. Cobertura Estratégica
```
✅ Alta prioridade: AuthService, TasksService (lógica crítica)
✅ Média prioridade: Guards, Validators
✅ Baixa prioridade: Controllers (delegam para services)
```

---

## 🔧 Configuração

### jest.config.js (por serviço)
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.entity.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

### Turborepo Pipeline
```json
{
  "test": {
    "dependsOn": ["^build"],
    "outputs": ["coverage/**"]
  }
}
```

---

## 📈 Próximos Passos

### Curto Prazo
- [ ] Adicionar testes para NotificationsService
- [ ] Adicionar testes para Guards (JwtAuthGuard)
- [ ] Adicionar testes para Validators customizados

### Médio Prazo
- [ ] Testes de integração (supertest)
- [ ] CI/CD com GitHub Actions
- [ ] Coverage mínimo de 80%

### Longo Prazo
- [ ] E2E tests com Playwright (fluxos críticos)
- [ ] Visual regression tests
- [ ] Performance tests (carga)

---

## 🤝 Contribuindo

Ao adicionar novos testes:

1. **Siga a estrutura modular**
   - Crie arquivo específico para o domínio
   - Use `__tests__/` directory

2. **Reutilize test-helpers**
   - Não duplique mocks
   - Adicione novos helpers se necessário

3. **Mantenha testes isolados**
   - Sem dependências entre testes
   - Use `beforeEach` para limpar state

4. **Documente casos complexos**
   - Adicione comentários quando necessário
   - Explique o "porquê" não o "o quê"

---

## 📚 Referências

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Clean Code Principles](https://www.freecodecamp.org/news/clean-coding-for-beginners/)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
