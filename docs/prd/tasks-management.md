# PRD: Tasks Management

## 1. Visão Geral

### 1.1 Objetivo

Implementar um sistema completo de gerenciamento de tarefas para o Task Manager API, permitindo que usuários criem, visualizem, atualizem e deletem tarefas, com controle de acesso baseado em roles e atribuição de tarefas a membros de equipes específicas.

### 1.2 Escopo

Este PRD cobre:

- Criação de tarefas associadas a equipes e membros
- Listagem de tarefas (com controle de acesso por role)
- Atualização de tarefas (com regras de autorização)
- Exclusão de tarefas
- Gerenciamento de status e prioridade das tarefas
- Validação de dados de entrada
- Controle de acesso baseado em roles (Admin e Member)

**Fora do escopo (futuras iterações):**

- Filtros avançados de busca (por status, prioridade, data)
- Paginação de resultados
- Ordenação de tarefas
- Histórico de alterações
- Tarefas recorrentes

## 2. Requisitos Funcionais

### 2.1 Criar Tarefa

#### 2.1.1 Descrição

Permitir que usuários criem novas tarefas associadas a uma equipe e atribuídas a um membro específico.

#### 2.1.2 Endpoint

```
POST /tasks/:teamId/:assignedTo
```

#### 2.1.3 Parâmetros da URL

- **teamId**: UUID da equipe à qual a tarefa pertence (obrigatório)
- **assignedTo**: UUID do usuário ao qual a tarefa será atribuída (obrigatório)

#### 2.1.4 Request Body

```json
{
  "title": "string (obrigatório, mínimo 2 caracteres, máximo 100 caracteres)",
  "description": "string (opcional, máximo 100 caracteres)",
  "priority": "HIGH" | "MEDIUM" | "LOW (padrão: MEDIUM)",
  "status": "PENDING" | "IN_PROGRESS" | "COMPLETED (padrão: PENDING)"
}
```

#### 2.1.5 Validações

- **title**:
  - Obrigatório
  - Mínimo 2 caracteres
  - Máximo 100 caracteres
- **description**:
  - Opcional
  - Máximo 100 caracteres
- **priority**:
  - Opcional
  - Valores permitidos: "HIGH", "MEDIUM", "LOW"
  - Padrão: "MEDIUM"
- **status**:
  - Opcional
  - Valores permitidos: "PENDING", "IN_PROGRESS", "COMPLETED"
  - Padrão: "PENDING"
- **teamId**: Deve existir no banco de dados
- **assignedTo**: Deve existir no banco de dados

#### 2.1.6 Resposta de Sucesso (201 Created)

```json
{
  "task": {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "PENDING" | "IN_PROGRESS" | "COMPLETED",
    "priority": "HIGH" | "MEDIUM" | "LOW",
    "assigned_to": "uuid",
    "teamId": "uuid",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

#### 2.1.7 Respostas de Erro

- **400 Bad Request**: Dados inválidos ou parâmetros incorretos
- **500 Internal Server Error**: Erro interno do servidor

#### 2.1.8 Comportamento

1. Validar os dados de entrada usando Zod
2. Verificar se a equipe (teamId) existe no banco de dados
3. Verificar se o usuário (assignedTo) existe no banco de dados
4. Criar a tarefa no banco de dados com os dados fornecidos
5. Retornar os dados da tarefa criada

### 2.2 Listar Tarefas

#### 2.2.1 Descrição

Permitir que administradores visualizem todas as tarefas do sistema.

#### 2.2.2 Endpoint

```
GET /tasks
```

#### 2.2.3 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem acessar este endpoint

#### 2.2.4 Resposta de Sucesso (200 OK)

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "status": "PENDING" | "IN_PROGRESS" | "COMPLETED",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "assigned_to": "uuid",
      "teamId": "uuid",
      "created_at": "ISO 8601 datetime",
      "updated_at": "ISO 8601 datetime"
    }
  ]
}
```

#### 2.2.5 Respostas de Erro

- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (não é ADMIN)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.2.6 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN através do middleware de autorização
3. Buscar todas as tarefas no banco de dados
4. Retornar lista de tarefas

### 2.3 Atualizar Tarefa

#### 2.3.1 Descrição

Permitir que usuários atualizem tarefas existentes. Administradores podem atualizar qualquer tarefa, enquanto membros só podem atualizar tarefas atribuídas a eles.

#### 2.3.2 Endpoint

```
PUT /tasks/:taskId
```

#### 2.3.3 Parâmetros da URL

- **taskId**: UUID da tarefa a ser atualizada (obrigatório)

#### 2.3.4 Request Body

```json
{
  "title": "string (opcional, mínimo 2 caracteres, máximo 100 caracteres)",
  "description": "string (opcional, máximo 100 caracteres)",
  "priority": "HIGH" | "MEDIUM" | "LOW (opcional)",
  "status": "PENDING" | "IN_PROGRESS" | "COMPLETED (opcional)"
}
```

**Nota**: Todos os campos são opcionais. Apenas os campos fornecidos serão atualizados.

#### 2.3.5 Autenticação e Autorização

- Requer autenticação JWT
- Usuários com role **ADMIN** podem atualizar qualquer tarefa
- Usuários com role **MEMBER** só podem atualizar tarefas onde `assigned_to` corresponde ao seu `userId`

#### 2.3.6 Validações

- **title**: Se fornecido, mínimo 2 caracteres, máximo 100 caracteres
- **description**: Se fornecido, máximo 100 caracteres
- **priority**: Se fornecido, deve ser "HIGH", "MEDIUM" ou "LOW"
- **status**: Se fornecido, deve ser "PENDING", "IN_PROGRESS" ou "COMPLETED"
- **taskId**: Deve existir no banco de dados

#### 2.3.7 Resposta de Sucesso (200 OK)

```json
{
  "updatedTask": {
    "id": "uuid",
    "title": "string",
    "description": "string | null",
    "status": "PENDING" | "IN_PROGRESS" | "COMPLETED",
    "priority": "HIGH" | "MEDIUM" | "LOW",
    "assigned_to": "uuid",
    "teamId": "uuid",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

#### 2.3.8 Respostas de Erro

- **400 Bad Request**: Dados inválidos, tarefa não encontrada ou sem permissão para atualizar
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (MEMBER tentando atualizar tarefa de outro usuário)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.3.9 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN ou MEMBER através do middleware de autorização
3. Buscar a tarefa no banco de dados pelo taskId
4. Se a tarefa não existir, retornar erro 400
5. Se o usuário for MEMBER, verificar se `task.assigned_to === userId`
6. Se MEMBER não tiver permissão, retornar erro 400 com mensagem "You do not have permission to update this task"
7. Atualizar a tarefa com os dados fornecidos
8. Retornar a tarefa atualizada

### 2.4 Deletar Tarefa

#### 2.4.1 Descrição

Permitir que usuários deletem tarefas do sistema.

#### 2.4.2 Endpoint

```
DELETE /tasks/:taskId
```

#### 2.4.3 Parâmetros da URL

- **taskId**: UUID da tarefa a ser deletada (obrigatório)

#### 2.4.4 Validações

- **taskId**: Deve existir no banco de dados

#### 2.4.5 Resposta de Sucesso (204 No Content)

Sem corpo de resposta.

#### 2.4.6 Respostas de Erro

- **400 Bad Request**: Tarefa não encontrada
- **500 Internal Server Error**: Erro interno do servidor

#### 2.4.7 Comportamento

1. Buscar a tarefa no banco de dados pelo taskId
2. Se a tarefa não existir, retornar erro 400
3. Deletar a tarefa do banco de dados
4. Retornar status 204 (No Content)

---

## 3. Requisitos Não Funcionais

### 3.1 Segurança

- **Validação de Entrada**: Todos os dados de entrada devem ser validados usando Zod para prevenir injection attacks
- **Autorização**: Controle rigoroso de acesso baseado em roles
- **Validação de Relacionamentos**: Verificar existência de equipes e usuários antes de criar tarefas

### 3.2 Performance

- **Indexação**: Campos `teamId` e `assigned_to` devem ser indexados para otimizar consultas
- **Consultas Eficientes**: Uso de Prisma ORM para otimizar queries ao banco de dados

### 3.3 Escalabilidade

- **Stateless**: Operações não dependem de estado do servidor
- **Transações**: Uso de transações do Prisma quando necessário para garantir consistência

### 3.4 Manutenibilidade

- **Código Modular**: Separar lógica em services, controllers e validators
- **Tratamento de Erros**: Implementar tratamento de erros consistente e informativo
- **Validação Centralizada**: Uso de schemas Zod reutilizáveis

---

## 4. Modelo de Dados

### 4.1 Schema Prisma - Task

```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

enum TaskPriority {
  HIGH
  MEDIUM
  LOW
}

model Task {
  id          String       @id @default(uuid())
  title       String       @db.VarChar(100)
  description String?
  status      TaskStatus   @default(PENDING)
  priority    TaskPriority @default(MEDIUM)

  assigned_to String
  user        User   @relation(fields: [assigned_to], references: [id])

  teamId String
  team   Team   @relation(fields: [teamId], references: [id])

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@map("tasks")
}
```

### 4.2 Campos

- **id**: UUID único gerado automaticamente
- **title**: Título da tarefa (máximo 100 caracteres)
- **description**: Descrição opcional da tarefa
- **status**: Status da tarefa (PENDING, IN_PROGRESS, COMPLETED), padrão: PENDING
- **priority**: Prioridade da tarefa (HIGH, MEDIUM, LOW), padrão: MEDIUM
- **assigned_to**: UUID do usuário ao qual a tarefa está atribuída (relacionamento com User)
- **teamId**: UUID da equipe à qual a tarefa pertence (relacionamento com Team)
- **created_at**: Data e hora de criação do registro
- **updated_at**: Data e hora da última atualização

### 4.3 Relacionamentos

- **Task → User**: Uma tarefa pertence a um usuário (assigned_to)
- **Task → Team**: Uma tarefa pertence a uma equipe (teamId)
- **User → Task**: Um usuário pode ter muitas tarefas
- **Team → Task**: Uma equipe pode ter muitas tarefas

---

## 5. Especificações Técnicas

### 5.1 Bibliotecas e Dependências

- **zod**: Validação de schemas
  - Versão: ^4.3.5 ou superior
- **@prisma/client**: ORM para acesso ao banco de dados
  - Versão: ^7.2.0 ou superior

### 5.2 Schema de Validação Zod

```typescript
const taskPriority = z.enum(['HIGH', 'MEDIUM', 'LOW'])
const taskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])

export const registerTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'Título deve ter no mínimo 2 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().max(100).optional(),
  priority: taskPriority.default('MEDIUM'),
  status: taskStatus.default('PENDING')
})
```

---

## 6. Critérios de Aceitação

### 6.1 Criar Tarefa

- [ ] ✅ Usuário pode criar tarefa fornecendo título, descrição (opcional), prioridade e status
- [ ] ✅ Sistema valida que o título tem no mínimo 2 caracteres e máximo 100 caracteres
- [ ] ✅ Sistema valida que a descrição tem no máximo 100 caracteres
- [ ] ✅ Sistema valida que a prioridade é HIGH, MEDIUM ou LOW (padrão: MEDIUM)
- [ ] ✅ Sistema valida que o status é PENDING, IN_PROGRESS ou COMPLETED (padrão: PENDING)
- [ ] ✅ Sistema valida que teamId existe no banco de dados
- [ ] ✅ Sistema valida que assignedTo existe no banco de dados
- [ ] ✅ Tarefa é criada com sucesso e retorna status 201
- [ ] ✅ Resposta inclui todos os dados da tarefa criada

### 6.2 Listar Tarefas

- [ ] ✅ Apenas usuários ADMIN podem listar todas as tarefas
- [ ] ✅ Sistema retorna erro 401 se token não for fornecido
- [ ] ✅ Sistema retorna erro 403 se usuário não for ADMIN
- [ ] ✅ Sistema retorna lista de todas as tarefas para ADMIN
- [ ] ✅ Resposta inclui todos os campos das tarefas

### 6.3 Atualizar Tarefa

- [ ] ✅ Usuário ADMIN pode atualizar qualquer tarefa
- [ ] ✅ Usuário MEMBER pode atualizar apenas tarefas atribuídas a ele
- [ ] ✅ Sistema retorna erro 400 se MEMBER tentar atualizar tarefa de outro usuário
- [ ] ✅ Sistema valida que taskId existe no banco de dados
- [ ] ✅ Sistema permite atualização parcial (apenas campos fornecidos são atualizados)
- [ ] ✅ Sistema valida campos fornecidos usando Zod
- [ ] ✅ Tarefa é atualizada com sucesso e retorna status 200
- [ ] ✅ Resposta inclui a tarefa atualizada

### 6.4 Deletar Tarefa

- [ ] ✅ Usuário pode deletar tarefa fornecendo taskId válido
- [ ] ✅ Sistema valida que taskId existe no banco de dados
- [ ] ✅ Sistema retorna erro 400 se tarefa não for encontrada
- [ ] ✅ Tarefa é deletada com sucesso e retorna status 204

### 6.5 Validação

- [ ] ✅ Todos os campos obrigatórios são validados
- [ ] ✅ Mensagens de erro são claras e informativas
- [ ] ✅ Validação de formato e tamanho funciona corretamente
- [ ] ✅ Validação de enums (status, priority) funciona corretamente

### 6.6 Autorização

- [ ] ✅ Middleware de autenticação protege rotas que requerem autenticação
- [ ] ✅ Middleware de autorização verifica roles corretamente
- [ ] ✅ MEMBER só pode atualizar próprias tarefas
- [ ] ✅ ADMIN tem acesso completo a todas as operações de listagem

---

## 7. Fluxos de Operação

### 7.1 Fluxo de Criação de Tarefa

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant Database
    participant Service

    Client->>API: POST /tasks/:teamId/:assignedTo<br/>{title, description, priority, status}
    API->>Validator: Validar dados (Zod)
    Validator-->>API: Dados válidos

    API->>Service: Criar tarefa
    Service->>Database: Verificar se teamId existe
    Database-->>Service: Equipe encontrada
    Service->>Database: Verificar se assignedTo existe
    Database-->>Service: Usuário encontrado
    Service->>Database: Criar tarefa
    Database-->>Service: Tarefa criada
    Service-->>API: Tarefa criada
    API-->>Client: 201 Created<br/>{task}
```

### 7.2 Fluxo de Atualização de Tarefa (MEMBER)

```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant AuthorizeMiddleware
    participant Controller
    participant Service
    participant Database

    Client->>AuthMiddleware: PUT /tasks/:taskId<br/>Bearer Token
    AuthMiddleware->>AuthMiddleware: Validar token JWT
    AuthMiddleware->>AuthorizeMiddleware: req.user disponível
    AuthorizeMiddleware->>AuthorizeMiddleware: Verificar role (ADMIN ou MEMBER)
    AuthorizeMiddleware->>Controller: Usuário autorizado

    Controller->>Service: Atualizar tarefa
    Service->>Database: Buscar tarefa por taskId
    Database-->>Service: Tarefa encontrada
    Service->>Service: Verificar se userRole === MEMBER
    Service->>Service: Verificar se task.assigned_to === userId
    Service->>Service: Permissão concedida
    Service->>Database: Atualizar tarefa
    Database-->>Service: Tarefa atualizada
    Service-->>Controller: Tarefa atualizada
    Controller-->>Client: 200 OK<br/>{updatedTask}
```

### 7.3 Fluxo de Erro - MEMBER Tentando Atualizar Tarefa de Outro

```mermaid
sequenceDiagram
    participant Client
    participant Service
    participant Database

    Client->>Service: PUT /tasks/:taskId<br/>(MEMBER, task de outro usuário)
    Service->>Database: Buscar tarefa por taskId
    Database-->>Service: Tarefa encontrada
    Service->>Service: Verificar se userRole === MEMBER
    Service->>Service: Verificar se task.assigned_to === userId
    Service->>Service: Permissão negada
    Service-->>Client: 400 Bad Request<br/>{message: "You do not have permission to update this task"}
```

---

## 8. Exemplos de Requisições e Respostas

### 8.1 Criar Tarefa

**Request:**

```http
POST /tasks/550e8400-e29b-41d4-a716-446655440000/660e8400-e29b-41d4-a716-446655440001
Content-Type: application/json

{
  "title": "Implementar feature de autenticação",
  "description": "Implementar login e registro de usuários",
  "priority": "HIGH",
  "status": "PENDING"
}
```

**Response (201 Created):**

```json
{
  "task": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Implementar feature de autenticação",
    "description": "Implementar login e registro de usuários",
    "status": "PENDING",
    "priority": "HIGH",
    "assigned_to": "660e8400-e29b-41d4-a716-446655440001",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (400 Bad Request - Dados inválidos):**

```json
{
  "issues": [
    {
      "code": "too_small",
      "minimum": 2,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Título deve ter no mínimo 2 caracteres",
      "path": ["title"]
    }
  ]
}
```

### 8.2 Listar Tarefas

**Request:**

```http
GET /tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "tasks": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "title": "Implementar feature de autenticação",
      "description": "Implementar login e registro de usuários",
      "status": "PENDING",
      "priority": "HIGH",
      "assigned_to": "660e8400-e29b-41d4-a716-446655440001",
      "teamId": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Response (403 Forbidden - Não é ADMIN):**

```json
{
  "error": "Acesso negado. Permissão insuficiente."
}
```

### 8.3 Atualizar Tarefa

**Request:**

```http
PUT /tasks/770e8400-e29b-41d4-a716-446655440002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

**Response (200 OK):**

```json
{
  "updatedTask": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Implementar feature de autenticação",
    "description": "Implementar login e registro de usuários",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "assigned_to": "660e8400-e29b-41d4-a716-446655440001",
    "teamId": "550e8400-e29b-41d4-a716-446655440000",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

**Response (400 Bad Request - Sem permissão):**

```json
{
  "message": "You do not have permission to update this task"
}
```

### 8.4 Deletar Tarefa

**Request:**

```http
DELETE /tasks/770e8400-e29b-41d4-a716-446655440002
```

**Response (204 No Content):**

Sem corpo de resposta.

**Response (400 Bad Request - Tarefa não encontrada):**

```json
{
  "message": "Task not found"
}
```

---

## 9. Próximos Passos

Após a implementação desta feature, as próximas etapas incluem:

1. Implementação de filtros avançados (por status, prioridade, equipe)
2. Implementação de paginação para listagem de tarefas
3. Implementação de ordenação (por data, prioridade, status)
4. Implementação de busca por texto (título, descrição)
5. Implementação de testes unitários e de integração
6. Documentação da API (Swagger/OpenAPI)
7. Implementação de notificações de mudanças de status
8. Implementação de histórico de alterações

---

## 10. Referências

- [Zod](https://zod.dev/) - Biblioteca de validação TypeScript-first
- [Express.js](https://expressjs.com/) - Framework web para Node.js
- [Prisma](https://www.prisma.io/) - ORM para Node.js e TypeScript
- [RESTful API Design](https://restfulapi.net/) - Boas práticas de design de APIs REST
