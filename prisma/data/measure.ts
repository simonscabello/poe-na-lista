export type MeasureKindSeed = "UNIT" | "WEIGHT"

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
  pricedByWeight: boolean
} {
  if (product.measureKind) {
    return {
      measureKind: product.measureKind,
      defaultUnit: product.defaultUnit ?? defaultUnitFor(product.measureKind),
      pricedByWeight: false,
    }
  }

  const { categorySlug, name } = product

  if (categorySlug === "acougue") {
    if (ACOURGUE_UNIT.has(name)) {
      return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
    }
    if (ACOURGUE_WEIGHT_DEFAULT) {
      // Açougue: a pessoa já pensa em kg ao planejar (ex: "1kg de carne moída").
      return { measureKind: "WEIGHT", defaultUnit: "kg", pricedByWeight: false }
    }
  }

  if (categorySlug === "hortifruti") {
    if (HORTIFRUTI_UNIT.has(name)) {
      return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
    }
    if (HORTIFRUTI_WEIGHT.has(name)) {
      // Comprado contando unidades (ex: "3 cebolas"), preço real só na balança do caixa.
      return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: true }
    }
    return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
  }

  if (categorySlug === "laticinios") {
    // Leite (caixa), creme de leite (lata), iogurte, queijo (pacote), etc.
    return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
  }

  if (categorySlug === "bebidas") {
    // Garrafa, lata, caixa — sempre unidade na lista de compras.
    return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
  }

  if (categorySlug === "mercearia" && MERCEARIA_UNIT_LIQUIDS.has(name)) {
    return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
  }

  // Demais categorias: pacotes, caixas, unidades.
  return { measureKind: "UNIT", defaultUnit: null, pricedByWeight: false }
}

function defaultUnitFor(kind: MeasureKindSeed): string | null {
  if (kind === "WEIGHT") return "kg"
  return null
}
