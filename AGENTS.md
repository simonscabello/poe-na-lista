<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Põe na Lista

App de listas de compras compartilhadas.

## Stack

Next.js 16 (App Router), React 19, Prisma 7 + MariaDB, NextAuth v5 (Google, JWT),
shadcn (base-nova) + `@base-ui/react`, Tailwind v4, React Query, Jotai, Biome. UI em pt-BR.

## Arquitetura

Fluxo: `page` → `feature` → `action` → `service` → Prisma.

| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| Pages | `src/app/` | Auth, fetch server-side, Suspense, `notFound`/`redirect` |
| Features | `src/features/<domain>/` | UI de domínio, schemas Zod, hooks client |
| Actions | `src/actions/*.actions.ts` | Validação, permissões, `revalidatePath`, `ActionResult` |
| Services | `src/services/*.service.ts` | Prisma, mapeamento para DTOs (`src/types/domain.ts`) |
| UI shared | `src/components/{ui,layout,common}/` | Primitivos, layout, empty states |

## Onde colocar código novo

- Nova mutação → Server Action em `src/actions/`, com `ActionResult` e validação Zod.
- Novo acesso ao banco → função em `src/services/`, retornando DTO.
- Nova tela → `page.tsx` em `src/app/` (Server Component) consumindo services.
- Nova UI de domínio → `src/features/<domain>/components/`.
- Proteção de rota → `src/proxy.ts` (não criar `middleware.ts`).

## Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run lint` / `npm run format` — Biome
- `npm run db:migrate` / `db:generate` / `db:studio` / `db:seed` — Prisma

## Regras detalhadas

Regras por contexto em `.cursor/rules/*.mdc`: `poe-na-lista-core`, `nextjs-16`,
`server-actions`, `services-prisma`, `features-ui`, `typescript-biome`.
