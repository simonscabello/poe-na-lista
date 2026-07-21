/**
 * UI-only helpers for presenting product categories.
 *
 * Categories are free-text strings stored on each Product (no dedicated table),
 * so this module derives emoji/labels purely for presentation. It never touches
 * business rules — it only makes the catalog pleasant to browse by touch.
 *
 * O objetivo é que TODO produto do catálogo tenha um glyph reconhecível (estilo
 * emoji, como o 🥚), evitando o ícone genérico. `PRODUCT_EMOJI` é avaliado em
 * ordem: padrões específicos/compostos vêm antes dos genéricos para não serem
 * "roubados" (ex.: `Óleo de Milho` casa com óleo antes de milho).
 */

// Chaveado pelo NOME de exibição da categoria (ex.: "Açougue"), em minúsculas.
const CATEGORY_EMOJI: Record<string, string> = {
  mercearia: "🥫",
  laticínios: "🥛",
  laticinios: "🥛",
  açougue: "🥩",
  acougue: "🥩",
  hortifrúti: "🥬",
  hortifruti: "🥬",
  padaria: "🍞",
  congelados: "🧊",
  "biscoitos e petiscos": "🍪",
  bebidas: "🥤",
  higiene: "🧴",
  limpeza: "🧹",
  bebê: "🍼",
  bebe: "🍼",
  "pet shop": "🐾",
}

/**
 * Overrides por produto — mais específico primeiro. Palavras-chave, não nomes
 * exatos, para que variações e produtos criados na hora também combinem.
 */
const PRODUCT_EMOJI: Array<[RegExp, string]> = [
  // ── Guardas de alta prioridade (evitam roubo por padrões genéricos abaixo) ──
  [/biscoito|bolacha/i, "🍪"], // "Biscoito Água e Sal" não pode virar 🧂

  // ── Óleos e gorduras (antes de milho/coco/soja) ──
  [/[óo]leo de coco/i, "🥥"],
  [/azeite|azeitona/i, "🫒"],
  [/[óo]leo/i, "🫗"],
  [/banha|manteiga|margarina/i, "🧈"],

  // ── Mercearia: grãos, farinhas, massas ──
  [/arroz/i, "🍚"],
  [/feij[ãa]o|lentilha|gr[ãa]o-?de-?bico/i, "🫘"],
  [/ervilha/i, "🫛"],
  [/pipoca/i, "🍿"],
  [/quinoa/i, "🌾"],
  [/fub[áa]|cuscuz|milho/i, "🌽"],
  [/tapioca/i, "🥞"],
  [/farinha/i, "🌾"],
  [/polvilho/i, "🌾"],
  [/macarr[ãa]o|espaguete|parafuso|penne|talharim|nhoque|lasanha|massa de|\bmassa\b/i, "🍝"],

  // ── Molhos e temperos ──
  [/molho de tomate|passata|extrato de tomate/i, "🍅"],
  [/shoyu|molho/i, "🥫"],
  [/pimenta|p[áa]prica|colorau/i, "🌶️"],
  [/curry/i, "🍛"],
  [/or[ée]gano|cominho|louro|chimichurri/i, "🌿"],
  [/\bsal grosso\b|\bsal\b/i, "🧂"],
  [/a[çc][úu]car/i, "🍬"],
  [/ado[çc]ante/i, "💧"],

  // ── Conservas ──
  [/atum|sardinha/i, "🐟"],
  [/palmito/i, "🎍"],
  [/seleta|legumes/i, "🥗"],

  // ── Café da manhã ──
  [/caf[eé]/i, "☕"],
  [/\bch[áa](\s|$)/i, "🍵"], // \b não fecha após acento; ancora em espaço/fim
  [/achocolatado|chocolate|bombom/i, "🍫"],
  [/melancia/i, "🍉"],
  [/mel[ãa]o/i, "🍈"],
  [/\bmel\b/i, "🍯"],
  [/geleia/i, "🍓"],
  [/aveia|granola|cereal/i, "🥣"],

  // ── Laticínios ──
  [/leite materno/i, "🍼"],
  [/requeij[ãa]o|cream cheese|ricota|queijo|p[ãa]o de queijo/i, "🧀"],
  [/leite|iogurte|bebida l[áa]ctea|petit suisse/i, "🥛"],
  [/flan|pudim|gelatina/i, "🍮"],

  // ── Açougue: aves, bovina, suína, embutidos, peixes ──
  [/frango|sobrecoxa|coxinha da asa|coxa de/i, "🍗"],
  [/peru/i, "🦃"],
  [/bacon/i, "🥓"],
  [/lingui[çc]a|salsicha/i, "🌭"],
  [/presunto|mortadela|salame|su[íi]n|lombo|pernil|costelinha/i, "🍖"],
  [/til[áa]pia|salm[ãa]o|merluza|bacalhau/i, "🐟"],
  [/camar[ãa]o/i, "🦐"],
  [/alcatra|contrafil[ée]|picanha|maminha|ac[ée]m|patinho|cox[ãa]o|carne|costela/i, "🥩"],

  // ── Hortifrúti: frutas ──
  [/banana/i, "🍌"],
  [/ma[çc][ãa]/i, "🍎"],
  [/\bpera\b/i, "🍐"],
  [/laranja/i, "🍊"],
  [/lim[ãa]o/i, "🍋"],
  [/mam[ãa]o/i, "🍈"],
  [/manga/i, "🥭"],
  [/abacaxi/i, "🍍"],
  [/\buva\b/i, "🍇"],
  [/morango/i, "🍓"],
  [/kiwi/i, "🥝"],
  [/abacate/i, "🥑"],

  // ── Hortifrúti: legumes e verduras ──
  [/batata frita|batata chips|batata palha/i, "🍟"],
  [/batata-?doce/i, "🍠"],
  [/batata/i, "🥔"],
  [/cenoura/i, "🥕"],
  [/tomate/i, "🍅"],
  [/cebola/i, "🧅"],
  [/\balho\b/i, "🧄"], // \balho\b não casa "Chocalho"
  [/chuchu|abobrinha|pepino/i, "🥒"],
  [/berinjela/i, "🍆"],
  [/piment[ãa]o/i, "🫑"],
  [/mandioca/i, "🥔"],
  [/couve-?flor|br[óo]colis/i, "🥦"],
  [/alface|r[úu]cula|couve|repolho|agri[ãa]o|espinafre/i, "🥬"],
  [/\bovo/i, "🥚"],

  // ── Padaria ──
  [/p[ãa]o|bisnaguinha|torrada|folheado/i, "🍞"],
  [/coxinha/i, "🍗"],
  [/quibe/i, "🥙"],
  [/esfiha/i, "🥟"],
  [/\bbolo\b/i, "🎂"],
  [/torta/i, "🥧"],
  [/sonho|rosquinha/i, "🍩"],
  [/carolina/i, "🧁"],

  // ── Congelados ──
  [/pizza/i, "🍕"],
  [/hamb[úu]rguer/i, "🍔"],
  [/nuggets/i, "🍗"],
  [/sorvete/i, "🍨"],
  [/picol[ée]/i, "🍦"],
  [/a[çc]a[íi]/i, "🫐"],
  [/polpa/i, "🧃"],

  // ── Biscoitos e petiscos ──
  [/biscoito|cookie|wafer|bolacha/i, "🍪"],
  [/\bbala\b|chiclete/i, "🍬"],
  [/pa[çc]oca|amendoim/i, "🥜"],
  [/castanha/i, "🌰"],
  [/salgadinho|salgado/i, "🥔"],

  // ── Bebidas ──
  [/(^|\s)[áa]gua de coco/i, "🥥"],
  [/(^|\s)[áa]gua/i, "💧"], // início/espaço evita casar "Enxaguante"
  [/refrigerante|isot[ôo]nico/i, "🥤"],
  [/suco/i, "🧃"],
  [/energ[ée]tico/i, "🔋"],
  [/cerveja/i, "🍺"],
  [/vinho/i, "🍷"],
  [/espumante/i, "🍾"],
  [/vodca|\bgin\b/i, "🍸"],
  [/whisky|cacha[çc]a/i, "🥃"],

  // ── Higiene ──
  [/papel higi[êe]nico|len[çc]o umedecido/i, "🧻"],
  [/sabonete/i, "🧼"],
  [/creme dental|escova de dente|escova dental|fio dental|enxaguante/i, "🪥"],
  [/barbear/i, "🪒"],
  [/perfume|col[ôo]nia/i, "🌸"],
  [
    /shampoo|condicionador|hidratante|desodorante|protetor solar|m[áa]scara capilar|creme para pentear|[óo]leo infantil/i,
    "🧴",
  ],

  // ── Limpeza ──
  [/vassoura|rodo|limpa piso/i, "🧹"],
  [/limpa vidro/i, "🪟"],
  [/esponja|palha de a[çc]o|pano de/i, "🧽"],
  [/saco de lixo|p[áa] de lixo|saco para descartar/i, "🗑️"],
  [/sab[ãa]o/i, "🧼"],
  [/detergente|amaciante|alvejante|desengordurante|desinfetante|multiuso|[áa]lcool/i, "🧴"],

  // ── Bebê ──
  [/fralda/i, "🧷"],
  [/mamadeira|chupeta|papinha|f[óo]rmula infantil/i, "🍼"],

  // ── Pet Shop ──
  [/gatos?|areia sanit[áa]ria/i, "🐱"],
  [/c[ãa]es|c[ãa]o|bifinho|ra[çc][ãa]o|sach[êe]/i, "🐶"],
]

const DEFAULT_EMOJI = "🛒"

/** Emoji for a category chip / fallback grouping. */
export function categoryEmoji(category: string | null | undefined): string {
  if (!category) return DEFAULT_EMOJI
  return CATEGORY_EMOJI[category.trim().toLowerCase()] ?? DEFAULT_EMOJI
}

/** Emoji that best represents a single product (name wins over category). */
export function productEmoji(name: string, category: string | null | undefined): string {
  for (const [pattern, emoji] of PRODUCT_EMOJI) {
    if (pattern.test(name)) return emoji
  }
  return categoryEmoji(category)
}

export const ALL_CATEGORIES = "__all__" as const
