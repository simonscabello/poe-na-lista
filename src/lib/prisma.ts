import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/generated/prisma/client"

function createAdapter() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não está definida")
  }

  const url = new URL(databaseUrl)
  const isLocalHost = url.hostname === "localhost" || url.hostname === "127.0.0.1"
  const allowPublicKeyRetrieval =
    url.searchParams.get("allowPublicKeyRetrieval") === "true" ||
    (url.searchParams.get("allowPublicKeyRetrieval") !== "false" && isLocalHost)

  return new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    allowPublicKeyRetrieval,
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({ adapter: createAdapter() })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
