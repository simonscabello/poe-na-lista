import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../src/generated/prisma/client.js"
import { catalog } from "./data/catalog.js"
import { categories } from "./data/categories.js"
import { globalStores } from "./data/global-stores.js"
import { resolveProductMeasure } from "./data/measure.js"
import { slugify } from "./lib/slugify.js"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL não está definida")
}

const url = new URL(databaseUrl)

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ""),
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

async function seedCategories() {
  const idBySlug = new Map<string, string>()

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        sortOrder: category.sortOrder,
        active: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
    })
    idBySlug.set(category.slug, record.id)
  }

  return idBySlug
}

async function seedProducts(categoryIdBySlug: Map<string, string>) {
  const canonicalSlugs: string[] = []
  let created = 0
  let updated = 0

  for (const product of catalog) {
    const slug = slugify(product.name)
    canonicalSlugs.push(slug)

    const categoryId = categoryIdBySlug.get(product.categorySlug) ?? null
    if (!categoryId) {
      throw new Error(`Categoria não encontrada para "${product.name}": ${product.categorySlug}`)
    }

    const { measureKind, defaultUnit, pricedByWeight } = resolveProductMeasure(product)

    // Reconcilia com placeholders legados do seed antigo (slug provisório = id).
    const existing = await prisma.product.findFirst({
      where: { isGlobal: true, OR: [{ slug }, { name: product.name }] },
      select: { id: true },
    })

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: product.name,
          slug,
          categoryId,
          active: true,
          householdId: null,
          measureKind,
          defaultUnit,
          pricedByWeight,
        },
      })
      updated += 1
      continue
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug,
        categoryId,
        isGlobal: true,
        active: true,
        measureKind,
        defaultUnit,
        pricedByWeight,
      },
    })
    created += 1
  }

  // Globais fora do catálogo oficial saem de cena sem quebrar FKs de itens existentes.
  const { count: deactivated } = await prisma.product.updateMany({
    where: { isGlobal: true, active: true, slug: { notIn: canonicalSlugs } },
    data: { active: false },
  })

  return { created, updated, deactivated }
}

function normalizeStoreName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

async function seedGlobalStores() {
  let created = 0
  let updated = 0

  for (const name of globalStores) {
    const normalizedName = normalizeStoreName(name)
    const existing = await prisma.globalStore.findUnique({ where: { normalizedName } })

    if (existing) {
      await prisma.globalStore.update({
        where: { normalizedName },
        data: { name, active: true },
      })
      updated += 1
      continue
    }

    await prisma.globalStore.create({ data: { name, normalizedName } })
    created += 1
  }

  return { created, updated }
}

async function main() {
  const categoryIdBySlug = await seedCategories()
  const { created, updated, deactivated } = await seedProducts(categoryIdBySlug)
  const globalStoreStats = await seedGlobalStores()

  console.log(
    `Seed concluído: ${categories.length} categorias, ${catalog.length} produtos globais ` +
      `(${created} criados, ${updated} atualizados, ${deactivated} desativados), ` +
      `${globalStores.length} lojas globais (${globalStoreStats.created} criadas, ${globalStoreStats.updated} atualizadas)`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
