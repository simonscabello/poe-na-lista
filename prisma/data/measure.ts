export type MeasureKindSeed = "UNIT" | "WEIGHT" | "VOLUME"

export type ProductSeed = {
  name: string
  categorySlug: string
  measureKind?: MeasureKindSeed
  defaultUnit?: string
}

/**
 * Produtos vendidos por unidade embalada (lata, caixa, garrafa, pacote),
 * mesmo quando o conteúdo é líquido.
 */
const ACOURGUE_UNIT = new Set([
  "Frango Inteiro",
  "Salsicha",
  "Linguiça Toscana",
  "Linguiça Calabresa",
  "Bacon",
])

/** Cortes e frios vendidos por peso no balcão. */
const ACOURGUE_WEIGHT_DEFAULT = true

/** Hortifrúti comprado por peso no saco/balança. */
const HORTIFRUTI_WEIGHT = new Set([
  "Banana",
  "Maçã",
  "Pera",
  "Laranja",
  "Limão",
  "Mamão",
  "Manga",
  "Uva",
  "Morango",
  "Batata",
  "Batata-Doce",
  "Cenoura",
  "Beterraba",
  "Tomate",
  "Cebola",
  "Chuchu",
  "Abobrinha",
  "Berinjela",
  "Pimentão",
  "Pepino",
  "Mandioca",
])

/** Frutas/verduras inteiras ou por maço — não por kg. */
const HORTIFRUTI_UNIT = new Set([
  "Abacaxi",
  "Melancia",
  "Melão",
  "Kiwi",
  "Abacate",
  "Alface",
  "Rúcula",
  "Couve",
  "Couve-Flor",
  "Brócolis",
  "Repolho",
  "Agrião",
  "Espinafre",
  "Alho",
  "Ovo Branco",
  "Ovo Vermelho",
  "Ovo Caipira",
  "Ovo de Codorna",
])

/**
 * Laticínios vendidos por litro (galão/refil). Caixas e latas são unidade.
 * Lista vazia de propósito: leite UHT e similares são comprados por caixa.
 */
const LATICINIOS_VOLUME = new Set<string>([])

/** Líquidos de mercearia embalados (garrafa, lata, sachê). */
const MERCEARIA_UNIT_LIQUIDS = new Set([
  "Óleo de Soja",
  "Óleo de Girassol",
  "Óleo de Milho",
  "Azeite de Oliva",
  "Óleo de Coco",
  "Molho de Tomate",
  "Passata de Tomate",
  "Extrato de Tomate",
  "Molho Barbecue",
  "Molho Shoyu",
  "Achocolatado",
  "Mel",
])

export function resolveProductMeasure(product: ProductSeed): {
  measureKind: MeasureKindSeed
  defaultUnit: string | null
} {
  if (product.measureKind) {
    return {
      measureKind: product.measureKind,
      defaultUnit: product.defaultUnit ?? defaultUnitFor(product.measureKind),
    }
  }

  const { categorySlug, name } = product

  if (categorySlug === "acougue") {
    if (ACOURGUE_UNIT.has(name)) {
      return { measureKind: "UNIT", defaultUnit: null }
    }
    if (ACOURGUE_WEIGHT_DEFAULT) {
      return { measureKind: "WEIGHT", defaultUnit: "kg" }
    }
  }

  if (categorySlug === "hortifruti") {
    if (HORTIFRUTI_UNIT.has(name)) {
      return { measureKind: "UNIT", defaultUnit: null }
    }
    if (HORTIFRUTI_WEIGHT.has(name)) {
      return { measureKind: "WEIGHT", defaultUnit: "kg" }
    }
    return { measureKind: "UNIT", defaultUnit: null }
  }

  if (categorySlug === "laticinios") {
    if (LATICINIOS_VOLUME.has(name)) {
      return { measureKind: "VOLUME", defaultUnit: "L" }
    }
    // Leite (caixa), creme de leite (lata), iogurte, queijo (pacote), etc.
    return { measureKind: "UNIT", defaultUnit: null }
  }

  if (categorySlug === "bebidas") {
    // Garrafa, lata, caixa — sempre unidade na lista de compras.
    return { measureKind: "UNIT", defaultUnit: null }
  }

  if (categorySlug === "mercearia" && MERCEARIA_UNIT_LIQUIDS.has(name)) {
    return { measureKind: "UNIT", defaultUnit: null }
  }

  // Demais categorias: pacotes, caixas, unidades.
  return { measureKind: "UNIT", defaultUnit: null }
}

function defaultUnitFor(kind: MeasureKindSeed): string | null {
  if (kind === "WEIGHT") return "kg"
  if (kind === "VOLUME") return "L"
  return null
}
