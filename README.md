# Venda de Ingressos API

Backend de um sistema de venda de ingressos para shows. Projeto de estudo com foco em integridade transacional, controle de estoque e simulação de gateway de pagamento.

## Modelagem e Event Storming

### Modelo de Dados (Oracle Data Modeler)

![Modelagem do Banco de Dados](docs/modelagem_bd.png)

### Event Storming

![Event Storming](docs/event-storming.png)

## Stack

- **Node.js** + **TypeScript** (ESM / Node16)
- **Express 5**
- **PostgreSQL** via [Neon](https://neon.tech) — queries com `pg` puro (sem ORM)
- **Zod** para validação de entrada

## Configuração

```bash
# 1. Instalar dependências
pnpm install

# 2. Criar o arquivo .env na raiz
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# 3. Rodar a migration (cria tabelas e ENUMs no Neon)
pnpm migrate

# 4. Iniciar servidor em modo desenvolvimento
pnpm dev
```

Servidor sobe em `http://localhost:3000`.

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Servidor com hot reload (nodemon) |
| `pnpm migrate` | Executa DDL no banco (rode uma vez) |
| `pnpm build` | Compila TypeScript para `dist/` |
| `pnpm start` | Sobe a versão compilada |

## Arquitetura

Estrutura modular — cada entidade tem seu próprio slice de `routes → controller → service → schema`:

```
src/
  app.ts                        # Express: middlewares, rotas, errorHandler
  server.ts                     # Apenas listen()
  database/
    pool.ts                     # Pool pg (singleton)
    migrate.ts                  # Runner da migration
    migrations/001_create_tables.sql
  modules/
    usuario/                    # CRUD de usuários
    show/                       # Criação de shows + ingressos
    pedido/                     # Reserva, pagamento e cancelamento
    ingresso/                   # Listagem e validação na porta
  shared/
    errors/AppError.ts
    middleware/errorHandler.ts
    utils/asyncHandler.ts
    types/index.ts
```

## Modelo de Dados

```
USUARIO ──< PEDIDO >── METODO_PAGAMENTO
              │
              └──< INGRESSO >── SHOW
```

**ENUMs:**
- `dm_status_pagamento`: `PENDENTE` · `PAGO` · `RECUSADO`
- `dm_status_ingresso`: `DISPONIVEL` · `RESERVADO` · `VENDIDO`

## API

### Usuários
| Método | Rota | Body |
|---|---|---|
| `POST` | `/usuarios` | `{ nome, cpf, email }` |
| `GET` | `/usuarios` | — |
| `GET` | `/usuarios/:id` | — |

### Shows
| Método | Rota | Body |
|---|---|---|
| `POST` | `/shows` | `{ nome, data, local, quantidade_ingressos, preco_ingresso }` |
| `GET` | `/shows` | — |
| `GET` | `/shows/:id` | — |

### Pedidos
| Método | Rota | Body |
|---|---|---|
| `POST` | `/pedidos` | `{ usuario_id, show_id, quantidade, metodo_pagamento_id }` |
| `GET` | `/pedidos/:id` | — |
| `POST` | `/pedidos/:id/pagamento` | `{ aprovado: true \| false }` |

### Ingressos
| Método | Rota | Body |
|---|---|---|
| `GET` | `/ingressos?showId=X` | — |
| `GET` | `/ingressos/:id` | — |
| `POST` | `/ingressos/:id/validar` | — |

**IDs de método de pagamento** (inseridos pela migration):
`1` = CARTAO_CREDITO · `2` = CARTAO_DEBITO · `3` = PIX · `4` = BOLETO

## Fluxo de Compra

```
POST /shows         → cria show + N ingressos (status: DISPONIVEL)
POST /pedidos       → reserva ingressos (status: RESERVADO, timer 15min)
POST /pedidos/:id/pagamento { aprovado: true }
                    → ingressos viram VENDIDO, pedido vira PAGO
POST /ingressos/:id/validar
                    → valida ingresso VENDIDO na entrada do evento
```

Se o pagamento não for confirmado em **15 minutos**, os ingressos voltam automaticamente para `DISPONIVEL`.

## Regras de Negócio

- Máximo de **5 ingressos por usuário por show**
- Reserva usa `SELECT ... FOR UPDATE SKIP LOCKED` — dois usuários nunca travam o mesmo ingresso simultaneamente
- `pedido_id` em ingresso é `NULL` enquanto `DISPONIVEL`; preenchido ao reservar
