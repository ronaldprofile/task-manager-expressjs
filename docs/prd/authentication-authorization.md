# PRD: Authentication & Authorization

## 1. Visão Geral

### 1.1 Objetivo

Implementar um sistema completo de autenticação e autorização para o Task Manager API, permitindo que usuários se registrem, façam login e acessem recursos do sistema com base em seus roles e permissões.

### 1.2 Escopo

Este PRD cobre:

- Registro de novos usuários
- Login e autenticação via JWT
- Proteção de rotas através de middleware de autenticação
- Controle de acesso baseado em roles (Admin e Member)
- Validação de dados de entrada
- Criptografia de senhas

**Fora do escopo (futuras iterações):**

- Refresh tokens
- Recuperação de senha
- Verificação de email
- Rate limiting
- OAuth/Social login

### 1.3 Stakeholders

- **Desenvolvedores Backend**: Implementação da feature
- **Desenvolvedores Frontend**: Consumo da API de autenticação
- **Product Owner**: Definição de requisitos e prioridades
- **QA**: Testes e validação dos critérios de aceitação

---

## 2. Requisitos Funcionais

### 2.1 Registro de Usuário

#### 2.1.1 Descrição

Permitir que novos usuários se registrem no sistema fornecendo nome, email e senha.

#### 2.1.2 Endpoint

```
POST auth/register
```

#### 2.1.3 Request Body

```json
{
  "name": "string (obrigatório, mínimo 2 caracteres)",
  "email": "string (obrigatório, formato email válido, único no sistema)",
  "password": "string (obrigatório, mínimo 6 caracteres)"
}
```

#### 2.1.4 Validações

- **Nome**: Obrigatório, mínimo 2 caracteres, máximo 100 caracteres
- **Email**:
  - Obrigatório
  - Formato de email válido
  - Único no sistema (não pode haver duplicatas)
  - Máximo 255 caracteres
- **Senha**:
  - Obrigatória
  - Mínimo 6 caracteres
  - Será criptografada antes de ser armazenada no banco de dados

#### 2.1.5 Resposta de Sucesso (201 Created)

```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "MEMBER",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  },
  "token": "JWT token string"
}
```

#### 2.1.6 Respostas de Erro

- **400 Bad Request**: Dados inválidos ou email já cadastrado
- **500 Internal Server Error**: Erro interno do servidor

#### 2.1.7 Comportamento

1. Validar os dados de entrada usando Zod
2. Verificar se o email já existe no banco de dados
3. Se o email já existir, retornar erro 400
4. Criptografar a senha usando bcrypt (salt rounds: 10)
5. Criar o usuário no banco de dados com role padrão "MEMBER"
6. Gerar um token JWT contendo: userId, email e role
7. Retornar os dados do usuário (sem a senha) e o token

### 2.2 Login

#### 2.2.1 Descrição

Permitir que usuários existentes façam login fornecendo email e senha.

#### 2.2.2 Endpoint

```
POST auth/login
```

#### 2.2.3 Request Body

```json
{
  "email": "string (obrigatório)",
  "password": "string (obrigatório)"
}
```

#### 2.2.4 Validações

- **Email**: Obrigatório, formato de email válido
- **Senha**: Obrigatória

#### 2.2.5 Resposta de Sucesso (200 OK)

```json
{
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "ADMIN" | "MEMBER",
    "createdAt": "ISO 8601 datetime",
    "updatedAt": "ISO 8601 datetime"
  },
  "token": "JWT token string"
}
```

#### 2.2.6 Respostas de Erro

- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Credenciais inválidas (email não encontrado ou senha incorreta)
- **500 Internal Server Error**: Erro interno do servidor

#### 2.2.7 Comportamento

1. Validar os dados de entrada usando Zod
2. Buscar o usuário no banco de dados pelo email
3. Se o usuário não existir, retornar erro 401
4. Comparar a senha fornecida com o hash armazenado usando bcrypt
5. Se a senha não corresponder, retornar erro 401
6. Gerar um token JWT contendo: userId, email e role
7. Retornar os dados do usuário (sem a senha) e o token

### 2.3 Autenticação JWT

#### 2.3.1 Descrição

Middleware para proteger rotas que requerem autenticação, validando o token JWT presente no header da requisição.

#### 2.3.2 Header Requerido

```
Authorization: Bearer <JWT_TOKEN>
```

#### 2.3.3 Comportamento do Middleware

1. Extrair o token do header `Authorization`
2. Verificar se o token está presente
3. Validar a assinatura do token usando a secret key
4. Verificar se o token não expirou
5. Extrair o payload (userId, email, role)
6. Adicionar as informações do usuário ao objeto `req` (ex: `req.user`)
7. Permitir que a requisição continue para o próximo middleware/controller

#### 2.3.4 Respostas de Erro

- **401 Unauthorized**:
  - Token não fornecido
  - Token inválido
  - Token expirado

### 2.4 Autorização Baseada em Roles

#### 2.4.1 Descrição

Sistema de controle de acesso baseado em roles, onde diferentes roles têm diferentes permissões.

#### 2.4.2 Roles Disponíveis

- **ADMIN**: Acesso completo ao sistema

  - Gerenciar todos os usuários
  - Gerenciar todas as equipes
  - Visualizar e gerenciar todas as tarefas
  - Atribuir roles a usuários

- **MEMBER**: Acesso limitado
  - Visualizar tarefas da própria equipe
  - Editar apenas suas próprias tarefas
  - Visualizar informações básicas do perfil

#### 2.4.3 Middleware de Autorização

Middleware que verifica se o usuário autenticado possui a role necessária para acessar um recurso específico.

#### 2.4.4 Uso

```typescript
// Exemplo de uso em rotas
router.get(
  '/admin/users',
  authenticate,
  authorize(['ADMIN']),
  getUsersController
)
router.get(
  '/tasks',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  getTasksController
)
```

#### 2.4.5 Respostas de Erro

- **403 Forbidden**: Usuário autenticado mas sem permissão para acessar o recurso

---

## 3. Requisitos Não Funcionais

### 3.1 Segurança

- **Criptografia de Senhas**: Todas as senhas devem ser criptografadas usando bcrypt com salt rounds de 10 antes de serem armazenadas no banco de dados
- **JWT Secret**: A secret key do JWT deve ser armazenada em variável de ambiente e nunca commitada no repositório
- **Expiração de Token**: Tokens JWT devem ter tempo de expiração (recomendado: 24 horas)
- **HTTPS**: Em produção, todas as requisições devem ser feitas via HTTPS
- **Validação de Entrada**: Todos os dados de entrada devem ser validados usando Zod para prevenir injection attacks

### 3.2 Performance

- **Validação Rápida de Tokens**: A validação de tokens JWT deve ser eficiente e não impactar significativamente o tempo de resposta
- **Indexação**: O campo `email` na tabela `User` deve ser indexado para otimizar buscas durante o login

### 3.3 Escalabilidade

- **Stateless Authentication**: O uso de JWT permite que a autenticação seja stateless, facilitando a escalabilidade horizontal da aplicação
- **Sem Sessões no Servidor**: Não há necessidade de armazenar sessões no servidor, reduzindo a carga

### 3.4 Manutenibilidade

- **Código Modular**: Separar lógica de autenticação em módulos reutilizáveis (middlewares, services, controllers)
- **Tratamento de Erros**: Implementar tratamento de erros consistente e informativo
- **Logging**: Registrar tentativas de login falhadas para auditoria (futuro)

---

## 4. Modelo de Dados

### 4.1 Schema Prisma - User

```prisma
model User {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  password  String   // Hash bcrypt
  role      Role     @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
  @@index([email])
}

enum Role {
  ADMIN
  MEMBER
}
```

### 4.2 Campos

- **id**: UUID único gerado automaticamente
- **name**: Nome do usuário (máximo 100 caracteres)
- **email**: Email único do usuário (máximo 255 caracteres, indexado)
- **password**: Hash da senha gerado pelo bcrypt
- **role**: Role do usuário (ADMIN ou MEMBER), padrão: MEMBER
- **createdAt**: Data e hora de criação do registro
- **updatedAt**: Data e hora da última atualização

### 4.3 Relacionamentos (Futuros)

- User pode ter muitas Tasks (relacionamento será adicionado no PRD de Tasks)
- User pode pertencer a muitas Teams (relacionamento será adicionado no PRD de Teams)

---

## 5. Especificações Técnicas

### 5.1 Bibliotecas e Dependências

- **jsonwebtoken**: Geração e validação de tokens JWT

  - Versão: ^9.0.0 ou superior
  - Tipos: @types/jsonwebtoken

- **bcrypt**: Criptografia de senhas

  - Versão: ^5.1.0 ou superior
  - Tipos: @types/bcrypt

- **zod**: Validação de schemas
  - Versão: ^3.22.0 ou superior

### 5.2 Variáveis de Ambiente

```env
# JWT Configuration
JWT_SECRET=your-secret-key-here (mínimo 32 caracteres)
JWT_EXPIRES_IN=24h

# Database (já existente)
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
```

### 5.3 Payload do JWT

```typescript
interface JWTPayload {
  userId: string
  email: string
  role: 'ADMIN' | 'MEMBER'
  iat: number // Issued at
  exp: number // Expiration
}
```

### 5.4 Extensão do Tipo Express Request

```typescript
// src/types/express.d.ts
declare namespace Express {
  export interface Request {
    user?: {
      id: string
      email: string
      role: 'ADMIN' | 'MEMBER'
    }
  }
}
```

---

## 6. Critérios de Aceitação

### 6.1 Registro de Usuário

- [ ] ✅ Usuário pode se registrar fornecendo nome, email e senha válidos
- [ ] ✅ Sistema valida que o email é único e retorna erro se já existir
- [ ] ✅ Sistema valida que a senha tem no mínimo 6 caracteres
- [ ] ✅ Sistema valida que o email está em formato válido
- [ ] ✅ Senha é criptografada antes de ser armazenada no banco
- [ ] ✅ Token JWT é gerado e retornado após registro bem-sucedido
- [ ] ✅ Resposta não inclui a senha do usuário
- [ ] ✅ Usuário criado recebe role padrão "MEMBER"

### 6.2 Login

- [ ] ✅ Usuário pode fazer login com email e senha corretos
- [ ] ✅ Sistema retorna erro 401 se email não existir
- [ ] ✅ Sistema retorna erro 401 se senha estiver incorreta
- [ ] ✅ Token JWT é gerado e retornado após login bem-sucedido
- [ ] ✅ Resposta inclui dados do usuário (sem senha) e token
- [ ] ✅ Token contém userId, email e role no payload

### 6.3 Autenticação JWT

- [ ] ✅ Middleware valida token JWT presente no header Authorization
- [ ] ✅ Middleware retorna erro 401 se token não for fornecido
- [ ] ✅ Middleware retorna erro 401 se token for inválido
- [ ] ✅ Middleware retorna erro 401 se token estiver expirado
- [ ] ✅ Middleware adiciona informações do usuário ao objeto req
- [ ] ✅ Rotas protegidas requerem token válido para acesso

### 6.4 Autorização

- [ ] ✅ Middleware de autorização verifica role do usuário
- [ ] ✅ Middleware retorna erro 403 se usuário não tiver permissão
- [ ] ✅ Rotas de admin só podem ser acessadas por usuários com role ADMIN
- [ ] ✅ Rotas de member podem ser acessadas por ADMIN e MEMBER

### 6.5 Segurança

- [ ] ✅ Senhas são criptografadas com bcrypt (salt rounds: 10)
- [ ] ✅ JWT_SECRET é armazenado em variável de ambiente
- [ ] ✅ Tokens JWT têm tempo de expiração configurado
- [ ] ✅ Validação de entrada usando Zod em todos os endpoints

### 6.6 Validação

- [ ] ✅ Todos os campos obrigatórios são validados
- [ ] ✅ Mensagens de erro são claras e informativas
- [ ] ✅ Validação de formato de email funciona corretamente
- [ ] ✅ Validação de tamanho mínimo de senha funciona corretamente

---

## 7. Fluxos de Autenticação

### 7.1 Fluxo de Registro

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant Database
    participant Bcrypt
    participant JWT

    Client->>API: POST auth/register<br/>{name, email, password}
    API->>Validator: Validar dados (Zod)
    Validator-->>API: Dados válidos

    API->>Database: Verificar se email existe
    Database-->>API: Email não existe

    API->>Bcrypt: Criptografar senha
    Bcrypt-->>API: Hash da senha

    API->>Database: Criar usuário
    Database-->>API: Usuário criado

    API->>JWT: Gerar token
    JWT-->>API: Token JWT

    API-->>Client: 201 Created<br/>{user, token}
```

### 7.2 Fluxo de Login

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant Database
    participant Bcrypt
    participant JWT

    Client->>API: POST auth/login<br/>{email, password}
    API->>Validator: Validar dados (Zod)
    Validator-->>API: Dados válidos

    API->>Database: Buscar usuário por email
    Database-->>API: Usuário encontrado

    API->>Bcrypt: Comparar senha
    Bcrypt-->>API: Senha válida

    API->>JWT: Gerar token
    JWT-->>API: Token JWT

    API-->>Client: 200 OK<br/>{user, token}
```

### 7.3 Fluxo de Autenticação em Rotas Protegidas

```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware
    participant AuthorizeMiddleware
    participant Controller
    participant Database

    Client->>AuthMiddleware: Request com Bearer Token
    AuthMiddleware->>AuthMiddleware: Extrair token do header
    AuthMiddleware->>AuthMiddleware: Validar token JWT
    AuthMiddleware->>AuthMiddleware: Extrair payload (userId, email, role)
    AuthMiddleware->>AuthMiddleware: Adicionar user ao req
    AuthMiddleware->>AuthorizeMiddleware: req.user disponível

    AuthorizeMiddleware->>AuthorizeMiddleware: Verificar role do usuário
    AuthorizeMiddleware->>AuthorizeMiddleware: Comparar com roles permitidas
    AuthorizeMiddleware->>Controller: Usuário autorizado

    Controller->>Database: Executar operação
    Database-->>Controller: Dados
    Controller-->>Client: Response
```

### 7.4 Fluxo de Erro - Credenciais Inválidas

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant Bcrypt

    Client->>API: POST auth/login<br/>{email, password}
    API->>Database: Buscar usuário por email
    Database-->>API: Usuário encontrado

    API->>Bcrypt: Comparar senha
    Bcrypt-->>API: Senha inválida

    API-->>Client: 401 Unauthorized<br/>{message: "Credenciais inválidas"}
```

### 7.5 Fluxo de Erro - Token Inválido

```mermaid
sequenceDiagram
    participant Client
    participant AuthMiddleware

    Client->>AuthMiddleware: Request com token inválido/expirado
    AuthMiddleware->>AuthMiddleware: Validar token JWT
    AuthMiddleware->>AuthMiddleware: Token inválido/expirado
    AuthMiddleware-->>Client: 401 Unauthorized<br/>{message: "Token inválido ou expirado"}
```

---

## 8. Exemplos de Requisições e Respostas

### 8.1 Registro de Usuário

**Request:**

```http
POST auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (400 Bad Request - Email duplicado):**

```json
{
  "error": "Email já cadastrado",
  "field": "email"
}
```

### 8.2 Login

**Request:**

```http
POST auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**

```json
{
  "error": "Credenciais inválidas"
}
```

### 8.3 Requisição Autenticada

**Request:**

```http
GET tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "tasks": [...]
}
```

**Response (401 Unauthorized - Token ausente):**

```json
{
  "error": "Token não fornecido"
}
```

---

## 9. Próximos Passos

Após a implementação desta feature, as próximas etapas incluem:

1. Implementação dos testes unitários e de integração
2. Documentação da API (Swagger/OpenAPI)
3. Implementação de logs de auditoria
4. Consideração de refresh tokens em futuras iterações
5. Implementação de recuperação de senha
6. Implementação de verificação de email

---

## 10. Referências

- [JWT.io](https://jwt.io/) - Documentação sobre JWT
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Biblioteca de criptografia
- [Zod](https://zod.dev/) - Biblioteca de validação TypeScript-first
- [Express.js](https://expressjs.com/) - Framework web para Node.js
- [Prisma](https://www.prisma.io/) - ORM para Node.js e TypeScript
