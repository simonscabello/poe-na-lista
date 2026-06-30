# Põe na Lista

App de listas de compras compartilhadas para famílias. PWA mobile-first com Next.js 16.

## Começando

```bash
npm install
npm run db:up
npm run db:migrate
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run build` / `npm run start` — build e produção
- `npm run lint` / `npm run format` — Biome
- `npm run db:migrate` / `db:generate` / `db:studio` / `db:seed` — Prisma
- `npm run icons:generate` — ícones PWA

## Stack

Next.js 16 (App Router), React 19, Prisma 7 + MariaDB, NextAuth v5, shadcn, Tailwind v4.

Consulte [AGENTS.md](./AGENTS.md) para convenções de arquitetura e contribuição.
