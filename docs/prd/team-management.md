# PRD: Team Management

## 1. Visão Geral

### 1.1 Objetivo

Implementar um sistema completo de gerenciamento de equipes para o Task Manager API, permitindo que administradores criem, visualizem, atualizem equipes e gerenciem membros das equipes, com controle de acesso restrito apenas a usuários com role ADMIN.

### 1.2 Escopo

Este PRD cobre:

- Criação de equipes
- Listagem de todas as equipes
- Atualização de informações de equipes
- Adição de membros a equipes
- Remoção de membros de equipes
- Validação de dados de entrada
- Controle de acesso exclusivo para administradores

**Fora do escopo (futuras iterações):**

- Listagem de membros de uma equipe específica
- Listagem de tarefas de uma equipe específica

## 2. Requisitos Funcionais

### 2.1 Criar Equipe

#### 2.1.1 Descrição

Permitir que administradores criem novas equipes no sistema.

#### 2.1.2 Endpoint

```
POST /teams
```

#### 2.1.3 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem criar equipes

#### 2.1.4 Request Body

```json
{
  "name": "string (obrigatório, mínimo 2 caracteres, máximo 100 caracteres)",
  "description": "string (obrigatório, mínimo 2 caracteres, máximo 100 caracteres)"
}
```

#### 2.1.5 Validações

- **name**:
  - Obrigatório
  - Mínimo 2 caracteres
  - Máximo 100 caracteres
- **description**:
  - Obrigatório
  - Mínimo 2 caracteres
  - Máximo 100 caracteres

#### 2.1.6 Resposta de Sucesso (201 Created)

```json
{
  "team": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

#### 2.1.7 Respostas de Erro

- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (não é ADMIN)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.1.8 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN através do middleware de autorização
3. Validar os dados de entrada usando Zod
4. Criar a equipe no banco de dados com os dados fornecidos
5. Retornar os dados da equipe criada

### 2.2 Listar Equipes

#### 2.2.1 Descrição

Permitir que administradores visualizem todas as equipes do sistema.

#### 2.2.2 Endpoint

```
GET /teams
```

#### 2.2.3 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem acessar este endpoint

#### 2.2.4 Resposta de Sucesso (200 OK)

```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
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
3. Buscar todas as equipes no banco de dados
4. Retornar lista de equipes

### 2.3 Atualizar Equipe

#### 2.3.1 Descrição

Permitir que administradores atualizem informações de equipes existentes.

#### 2.3.2 Endpoint

```
PUT /teams/:teamId
```

#### 2.3.3 Parâmetros da URL

- **teamId**: UUID da equipe a ser atualizada (obrigatório)

#### 2.3.4 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem atualizar equipes

#### 2.3.5 Request Body

```json
{
  "name": "string (obrigatório, mínimo 2 caracteres, máximo 100 caracteres)",
  "description": "string (obrigatório, mínimo 2 caracteres, máximo 100 caracteres)"
}
```

**Nota**: Todos os campos são obrigatórios na atualização.

#### 2.3.6 Validações

- **name**: Obrigatório, mínimo 2 caracteres, máximo 100 caracteres
- **description**: Obrigatório, mínimo 2 caracteres, máximo 100 caracteres
- **teamId**: Deve existir no banco de dados

#### 2.3.7 Resposta de Sucesso (201 OK)

```json
{
  "team": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
}
```

#### 2.3.8 Respostas de Erro

- **400 Bad Request**: Dados inválidos ou equipe não encontrada
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (não é ADMIN)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.3.9 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN através do middleware de autorização
3. Validar os dados de entrada usando Zod
4. Buscar a equipe no banco de dados pelo teamId
5. Se a equipe não existir, retornar erro 400
6. Atualizar a equipe com os dados fornecidos
7. Retornar a equipe atualizada

### 2.4 Adicionar Membros à Equipe

#### 2.4.1 Descrição

Permitir que administradores adicionem um ou mais membros a uma equipe existente.

#### 2.4.2 Endpoint

```
POST /teams/:teamId/member/add
```

#### 2.4.3 Parâmetros da URL

- **teamId**: UUID da equipe à qual os membros serão adicionados (obrigatório)

#### 2.4.4 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem adicionar membros

#### 2.4.5 Request Body

```json
{
  "usersIds": ["uuid", "uuid", ...]
}
```

- **usersIds**: Array de UUIDs dos usuários a serem adicionados à equipe (obrigatório, mínimo 1 elemento)

#### 2.4.6 Validações

- **teamId**: Deve existir no banco de dados
- **usersIds**:
  - Deve ser um array
  - Deve conter pelo menos um elemento
  - Cada elemento deve ser um UUID válido
  - Cada usuário deve existir no banco de dados
  - Se um usuário já for membro da equipe, a operação deve ser idempotente (não gerar erro)

#### 2.4.7 Resposta de Sucesso (201 Created)

Sem corpo de resposta.

#### 2.4.8 Respostas de Erro

- **400 Bad Request**: Dados inválidos, equipe não encontrada ou usuários inválidos
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (não é ADMIN)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.4.9 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN através do middleware de autorização
3. Validar que teamId existe no banco de dados
4. Validar que usersIds é um array não vazio
5. Validar que cada usuário em usersIds existe no banco de dados
6. Criar registros na tabela TeamMember para cada usuário (usando transação)
7. Se um usuário já for membro da equipe, a operação deve ser idempotente
8. Retornar status 201 (Created)

### 2.5 Remover Membros da Equipe

#### 2.5.1 Descrição

Permitir que administradores removam um ou mais membros de uma equipe existente.

#### 2.5.2 Endpoint

```
DELETE /teams/:teamId/member/remove
```

#### 2.5.3 Parâmetros da URL

- **teamId**: UUID da equipe da qual os membros serão removidos (obrigatório)

#### 2.5.4 Autenticação e Autorização

- Requer autenticação JWT
- Apenas usuários com role **ADMIN** podem remover membros

#### 2.5.5 Request Body

```json
{
  "usersIds": ["uuid", "uuid", ...]
}
```

- **usersIds**: Array de UUIDs dos usuários a serem removidos da equipe (obrigatório, mínimo 1 elemento)

#### 2.5.6 Validações

- **teamId**: Deve existir no banco de dados
- **usersIds**:
  - Deve ser um array
  - Deve conter pelo menos um elemento
  - Cada elemento deve ser um UUID válido
  - Cada usuário deve ser membro da equipe

#### 2.5.7 Resposta de Sucesso (204 No Content)

Sem corpo de resposta.

#### 2.5.8 Respostas de Erro

- **400 Bad Request**: Dados inválidos, equipe não encontrada ou usuários não são membros
- **401 Unauthorized**: Token não fornecido ou inválido
- **403 Forbidden**: Usuário não possui permissão (não é ADMIN)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.5.9 Comportamento

1. Validar token JWT através do middleware de autenticação
2. Verificar se o usuário possui role ADMIN através do middleware de autorização
3. Validar que teamId existe no banco de dados
4. Validar que usersIds é um array não vazio
5. Validar que cada usuário em usersIds é membro da equipe
6. Deletar registros da tabela TeamMember para cada usuário (usando transação)
7. Retornar status 204 (No Content)

---

## 3. Requisitos Não Funcionais

### 3.1 Segurança

- **Validação de Entrada**: Todos os dados de entrada devem ser validados usando Zod para prevenir injection attacks
- **Autorização Rigorosa**: Apenas usuários ADMIN podem gerenciar equipes
- **Validação de Relacionamentos**: Verificar existência de equipes e usuários antes de operações

### 3.2 Performance

- **Indexação**: Campos `team_id` e `user_id` na tabela TeamMember devem ser indexados para otimizar consultas
- **Transações**: Uso de transações do Prisma para garantir consistência em operações de múltiplos membros
- **Consultas Eficientes**: Uso de Prisma ORM para otimizar queries ao banco de dados

### 3.3 Escalabilidade

- **Stateless**: Operações não dependem de estado do servidor
- **Transações Atômicas**: Operações de adicionar/remover múltiplos membros são atômicas

### 3.4 Manutenibilidade

- **Código Modular**: Separar lógica em services, controllers e validators
- **Tratamento de Erros**: Implementar tratamento de erros consistente e informativo
- **Validação Centralizada**: Uso de schemas Zod reutilizáveis
- **Idempotência**: Operações de adicionar membros devem ser idempotentes

---

## 4. Modelo de Dados

### 4.1 Schema Prisma - Team e TeamMember

```prisma
model Team {
  id          String       @id @default(uuid())
  name        String       @db.VarChar(100)
  description String

  created_at DateTime     @default(now())
  updated_at DateTime     @updatedAt
  members    TeamMember[]
  tasks      Task[]

  @@map("teams")
}

model TeamMember {
  id String @default(uuid())

  team    Team   @relation(fields: [team_id], references: [id])
  team_id String

  user    User   @relation(fields: [user_id], references: [id])
  user_id String

  created_at DateTime @default(now())

  @@id([user_id, team_id])
  @@map("teams_members")
}
```

### 4.2 Campos - Team

- **id**: UUID único gerado automaticamente
- **name**: Nome da equipe (máximo 100 caracteres)
- **description**: Descrição da equipe
- **created_at**: Data e hora de criação do registro
- **updated_at**: Data e hora da última atualização

### 4.3 Campos - TeamMember

- **id**: UUID único gerado automaticamente
- **team_id**: UUID da equipe (chave estrangeira)
- **user_id**: UUID do usuário (chave estrangeira)
- **created_at**: Data e hora de criação do registro
- **Chave Primária Composta**: (user_id, team_id) - garante que um usuário não pode ser membro da mesma equipe duas vezes

### 4.4 Relacionamentos

- **Team → TeamMember**: Uma equipe pode ter muitos membros (relacionamento um-para-muitos)
- **User → TeamMember**: Um usuário pode pertencer a muitas equipes (relacionamento um-para-muitos)
- **Team → Task**: Uma equipe pode ter muitas tarefas (relacionamento um-para-muitos)
- **TeamMember**: Tabela de junção que representa o relacionamento muitos-para-muitos entre User e Team

---

## 5. Especificações Técnicas

### 5.1 Bibliotecas e Dependências

- **zod**: Validação de schemas
  - Versão: ^4.3.5 ou superior
- **@prisma/client**: ORM para acesso ao banco de dados
  - Versão: ^7.2.0 ou superior

### 5.3 Schema de Validação Zod

```typescript
export const registerTeamSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .min(2, 'Descrição deve ter no mínimo 2 caracteres')
    .max(100, 'Descrição deve ter no máximo 100 caracteres')
})
```

---

## 6. Critérios de Aceitação

### 6.1 Criar Equipe

- [ ] ✅ Apenas usuários ADMIN podem criar equipes
- [ ] ✅ Sistema valida que o nome tem no mínimo 2 caracteres e máximo 100 caracteres
- [ ] ✅ Sistema valida que a descrição tem no mínimo 2 caracteres e máximo 100 caracteres
- [ ] ✅ Sistema retorna erro 401 se token não for fornecido
- [ ] ✅ Sistema retorna erro 403 se usuário não for ADMIN
- [ ] ✅ Equipe é criada com sucesso e retorna status 201
- [ ] ✅ Resposta inclui todos os dados da equipe criada

### 6.2 Listar Equipes

- [ ] ✅ Apenas usuários ADMIN podem listar todas as equipes
- [ ] ✅ Sistema retorna erro 401 se token não for fornecido
- [ ] ✅ Sistema retorna erro 403 se usuário não for ADMIN
- [ ] ✅ Sistema retorna lista de todas as equipes para ADMIN
- [ ] ✅ Resposta inclui todos os campos das equipes

### 6.3 Atualizar Equipe

- [ ] ✅ Apenas usuários ADMIN podem atualizar equipes
- [ ] ✅ Sistema valida que teamId existe no banco de dados
- [ ] ✅ Sistema valida que nome e descrição atendem aos requisitos
- [ ] ✅ Sistema retorna erro 400 se equipe não for encontrada
- [ ] ✅ Equipe é atualizada com sucesso e retorna status 201
- [ ] ✅ Resposta inclui a equipe atualizada

### 6.4 Adicionar Membros à Equipe

- [ ] ✅ Apenas usuários ADMIN podem adicionar membros
- [ ] ✅ Sistema valida que teamId existe no banco de dados
- [ ] ✅ Sistema valida que usersIds é um array não vazio
- [ ] ✅ Sistema valida que cada usuário existe no banco de dados
- [ ] ✅ Sistema adiciona múltiplos membros usando transação
- [ ] ✅ Operação é idempotente (não gera erro se usuário já for membro)
- [ ] ✅ Sistema retorna status 201 após sucesso

### 6.5 Remover Membros da Equipe

- [ ] ✅ Apenas usuários ADMIN podem remover membros
- [ ] ✅ Sistema valida que teamId existe no banco de dados
- [ ] ✅ Sistema valida que usersIds é um array não vazio
- [ ] ✅ Sistema valida que cada usuário é membro da equipe
- [ ] ✅ Sistema remove múltiplos membros usando transação
- [ ] ✅ Sistema retorna status 204 após sucesso

### 6.6 Validação

- [ ] ✅ Todos os campos obrigatórios são validados
- [ ] ✅ Mensagens de erro são claras e informativas
- [ ] ✅ Validação de formato e tamanho funciona corretamente

### 6.7 Autorização

- [ ] ✅ Middleware de autenticação protege todas as rotas
- [ ] ✅ Middleware de autorização verifica que apenas ADMIN pode acessar
- [ ] ✅ Sistema retorna erro 403 para usuários MEMBER tentando acessar rotas de equipes

## 8. Exemplos de Requisições e Respostas

### 8.1 Criar Equipe

**Request:**

```http
POST /teams
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Equipe de Desenvolvimento",
  "description": "Equipe responsável pelo desenvolvimento do produto"
}
```

**Response (201 Created):**

```json
{
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Equipe de Desenvolvimento",
    "description": "Equipe responsável pelo desenvolvimento do produto",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (403 Forbidden - Não é ADMIN):**

```json
{
  "error": "Acesso negado. Permissão insuficiente."
}
```

### 8.2 Listar Equipes

**Request:**

```http
GET /teams
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "teams": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Equipe de Desenvolvimento",
      "description": "Equipe responsável pelo desenvolvimento do produto",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 8.3 Atualizar Equipe

**Request:**

```http
PUT /teams/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Equipe de Desenvolvimento Full Stack",
  "description": "Equipe responsável pelo desenvolvimento full stack do produto"
}
```

**Response (201 OK):**

```json
{
  "team": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Equipe de Desenvolvimento Full Stack",
    "description": "Equipe responsável pelo desenvolvimento full stack do produto",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T11:45:00.000Z"
  }
}
```

### 8.4 Adicionar Membros à Equipe

**Request:**

```http
POST /teams/550e8400-e29b-41d4-a716-446655440000/member/add
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "usersIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002"
  ]
}
```

**Response (201 Created):**

Sem corpo de resposta.

**Response (400 Bad Request - Equipe não encontrada):**

```json
{
  "message": "Team not found"
}
```

### 8.5 Remover Membros da Equipe

**Request:**

```http
DELETE /teams/550e8400-e29b-41d4-a716-446655440000/member/remove
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "usersIds": [
    "660e8400-e29b-41d4-a716-446655440001"
  ]
}
```

**Response (204 No Content):**

Sem corpo de resposta.

---

## 9. Próximos Passos

Após a implementação desta feature, as próximas etapas incluem:

1. Implementação de listagem de membros de uma equipe específica
2. Implementação de listagem de tarefas de uma equipe específica
3. Implementação de estatísticas de equipes
4. Implementação de hierarquia de equipes
5. Implementação de líderes de equipe
6. Implementação de testes unitários e de integração
7. Documentação da API (Swagger/OpenAPI)
8. Implementação de convites para equipes
9. Implementação de histórico de alterações

---

## 10. Referências

- [Zod](https://zod.dev/) - Biblioteca de validação TypeScript-first
- [Express.js](https://expressjs.com/) - Framework web para Node.js
- [Prisma](https://www.prisma.io/) - ORM para Node.js e TypeScript
- [RESTful API Design](https://restfulapi.net/) - Boas práticas de design de APIs REST
