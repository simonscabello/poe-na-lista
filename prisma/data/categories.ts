export type CategorySeed = {
  name: string
  slug: string
  icon: string
  sortOrder: number
}

export const categories: CategorySeed[] = [
  { name: "Mercearia", slug: "mercearia", icon: "Package", sortOrder: 1 },
  { name: "Laticínios", slug: "laticinios", icon: "Milk", sortOrder: 2 },
  { name: "Açougue", slug: "acougue", icon: "Beef", sortOrder: 3 },
  { name: "Hortifrúti", slug: "hortifruti", icon: "Apple", sortOrder: 4 },
  { name: "Padaria", slug: "padaria", icon: "Croissant", sortOrder: 5 },
  { name: "Congelados", slug: "congelados", icon: "Snowflake", sortOrder: 6 },
  { name: "Biscoitos e Petiscos", slug: "biscoitos-e-petiscos", icon: "Cookie", sortOrder: 7 },
  { name: "Bebidas", slug: "bebidas", icon: "CupSoda", sortOrder: 8 },
  { name: "Higiene", slug: "higiene", icon: "HeartHandshake", sortOrder: 9 },
  { name: "Limpeza", slug: "limpeza", icon: "Sparkles", sortOrder: 10 },
  { name: "Bebê", slug: "bebe", icon: "Baby", sortOrder: 11 },
  { name: "Pet Shop", slug: "pet-shop", icon: "PawPrint", sortOrder: 12 },
]
