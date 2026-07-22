# Tenant Manager — SSA Fight Wear

Monorepo do painel administrativo da SSA Fight Wear. Especificação completa de produto e arquitetura em
[`tenant-manager-blueprint.html`](./tenant-manager-blueprint.html) — este repositório é o esqueleto de código
que implementa a fatia inicial dele: autenticação + RBAC + cadastro de produtos com matriz de variações,
rodando de ponta a ponta (banco → API → tela), com os demais módulos (estoque, pedidos, clientes, financeiro,
fiscal, marketing, relatórios) já modelados no banco e com CRUD funcional na API e telas de leitura no painel.

## Estrutura

```
apps/
  tenant-manager-api/    API core em NestJS (fonte da verdade)
  tenant-manager-web/    Painel administrativo em Next.js
packages/
  database/              Schema Prisma + seed — usado pela API
```

## Pré-requisitos

- Node.js 18+
- Docker (para Postgres e Redis locais) — ou aponte `DATABASE_URL` para um Postgres já existente

## Subindo o ambiente

```bash
# 1. Instalar dependências de todo o monorepo
npm install

# 2. Subir Postgres e Redis
docker compose up -d

# 3. Configurar variáveis de ambiente
cp .env.example .env
# edite .env se necessário (segredos JWT, etc.)

# 4. Gerar o client do Prisma e aplicar o schema
npm run db:generate
npm run db:migrate

# 5. Popular dados de exemplo (tenant, papéis, permissões, admin, produto com variações)
npm run db:seed

# 6. Subir a API (http://localhost:3001/v1)
npm run dev:api

# 7. Em outro terminal, subir o painel (http://localhost:3000)
npm run dev:web
```

Login de exemplo após o seed: `admin@ssafightwear.com.br` / `trocar123`.

## O que já funciona de ponta a ponta

- **Autenticação** — JWT de acesso (15 min) + refresh token rotativo em cookie httpOnly (7 dias).
- **RBAC** — papéis (`OWNER_ADMIN`, `FINANCEIRO`, `ESTOQUE`, `ATENDIMENTO`, `MARKETING`, `AUDITOR`) e permissões
  granulares verificadas no backend, nunca só escondidas no front.
- **Produtos & variações** — cadastro do produto-pai e geração automática da matriz de variações
  (cor × tamanho × modelo × material), sem nunca duplicar uma combinação já existente.
- **Estoque** — movimentações (entrada/saída/ajuste) com atualização do saldo do SKU.
- **Pedidos, clientes, financeiro, marketing** — CRUD e listagem funcionais sobre o schema completo.
- **Relatório de vendas × estoque** — por SKU, quanto vendeu em 30 dias, quanto tem e a cobertura projetada.
- **Auditoria** — toda escrita relevante é registrada em `audit_logs` automaticamente via interceptor global.

## O que é esqueleto — plugue o provedor real

- **Fiscal (NF-e/NFC-e)** — o fluxo e o modelo de dados existem; falta plugar um provedor (Focus NF-e, eNotas)
  e o cofre de segredos para o certificado A1.
- **IA** — endpoints de importação de nota fiscal e copiloto retornam uma resposta mock; troque por
  `@anthropic-ai/sdk` ou `openai` mantendo o mesmo contrato de rota.
- **Integrações de pagamento/frete/e-mail** — a tela de status já lê a presença das variáveis de ambiente;
  falta implementar as chamadas reais a cada provedor.

## Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev:api` | Sobe a API em modo watch |
| `npm run dev:web` | Sobe o painel Next.js |
| `npm run db:studio` | Abre o Prisma Studio para inspecionar o banco |
| `npm run build:api` / `npm run build:web` | Build de produção de cada app |
