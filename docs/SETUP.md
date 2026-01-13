# Guia de Configuração - Authentication & Authorization

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Server Configuration
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager

# JWT Configuration
JWT_SECRET=your-secret-key-here-minimum-32-characters-long
JWT_EXPIRES_IN=24h
```

**Importante:**

- `JWT_SECRET` deve ter no mínimo 32 caracteres para segurança adequada
- `DATABASE_URL` deve apontar para seu banco de dados PostgreSQL
- Nunca commite o arquivo `.env` no repositório

## Passos para Configuração

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**

   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Gerar Prisma Client:**

   ```bash
   npx prisma generate
   ```

4. **Executar migrações do banco de dados:**

   ```bash
   npx prisma migrate dev
   ```

5. **Iniciar o servidor:**
   ```bash
   npm run dev
   ```

## Endpoints Disponíveis

### POST /auth/register

Registra um novo usuário no sistema.

**Request Body:**

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**

```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "JWT_TOKEN_HERE"
}
```

### POST /auth/login

Autentica um usuário existente.

**Request Body:**

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "JWT_TOKEN_HERE"
}
```

## Uso dos Middlewares

### Autenticação

Para proteger uma rota, use o middleware `authenticate`:

```typescript
import { authenticate } from './auth/middlewares/authenticate.middleware.js'

router.get('/protected', authenticate, (req, res) => {
  // req.user está disponível aqui
  res.json({ user: req.user })
})
```

### Autorização

Para restringir acesso por role, use o middleware `authorize`:

```typescript
import { authenticate } from './auth/middlewares/authenticate.middleware.js'
import { authorize } from './auth/middlewares/authorize.middleware.js'

// Apenas ADMIN pode acessar
router.get(
  '/admin/users',
  authenticate,
  authorize(['ADMIN']),
  getUsersController
)

// ADMIN e MEMBER podem acessar
router.get(
  '/tasks',
  authenticate,
  authorize(['ADMIN', 'MEMBER']),
  getTasksController
)
```
