# Marca — Põe na Lista

## Conceito: "Feira Fresca"

Compra da casa resolvida e com frescor de feira. O símbolo é um **carrinho de
mercado desconstruído** — cesto geométrico, alça e rodas soltas, e um ponto
tangerina "caindo" no carrinho (o item sendo posto na lista) — sobre gradiente
esmeralda. Neutros quentes tom "papel" remetem à lista de compras física.

## Paleta

| Token | Light | Dark | Uso |
|---|---|---|---|
| `primary` | `oklch(0.56 0.13 160)` ≈ `#0e7a50` | `oklch(0.72 0.14 160)` | Marca, ações principais |
| `brand-accent` | `oklch(0.75 0.14 60)` ≈ `#ffae4f` | `oklch(0.78 0.13 62)` | Destaques pontuais |
| `background` | `oklch(0.985 0.005 100)` ≈ `#f7f8f3` | `oklch(0.165 0.012 155)` | Fundo "papel" |
| `success` | `oklch(0.58 0.13 158)` | `oklch(0.72 0.14 158)` | Confirmações |
| `warning` | `oklch(0.55 0.13 70)` | `oklch(0.8 0.13 80)` | Alertas (padrão `text-warning` / `bg-warning/10`) |
| `destructive` | `oklch(0.577 0.215 27)` | `oklch(0.7 0.19 22)` | Erros, exclusão |
| `info` | `oklch(0.6 0.12 245)` | `oklch(0.7 0.11 245)` | Informação |
| `chart-1..5` | verde, tangerina, azul, roxo, teal | idem mais claros | Gráficos |

Gradiente da marca: `#1fb673 → #0c7a4b` (45°).

## Tipografia

- **Títulos**: Bricolage Grotesque (`--font-heading`, classe `font-heading`)
- **Corpo**: Geist (`--font-sans`)
- **Números/código**: Geist Mono (`--font-mono`)

## Forma, sombra e movimento

- Raio base `--radius: 0.8rem`; sombras esverdeadas suaves (`--shadow-2xs` … `--shadow-xl`).
- Durações: 150/200/300ms (`--duration-fast/normal/slow`); easings `--ease-out-quart` e `--ease-spring`.
- Animações utilitárias: `animate-fade-up`, `animate-pop-in`, `.stagger-children`,
  `.animate-page-in` (template do dashboard), `.skeleton-shimmer`.
- `prefers-reduced-motion` desativa tudo globalmente.

## Assets

Fonte única: `scripts/generate-icons.mjs` (`npm run icons:generate`) gera favicon,
ícones PWA (any + maskable), OG image e as fontes de `public/icons/_source/`.
O componente `src/components/common/app-logo.tsx` usa a mesma geometria em SVG inline.

## Prompts para IA de imagem (assets de alta fidelidade)

Contexto comum a todos: *"Põe na Lista" é um app brasileiro de lista de compras
compartilhada para famílias. Conceito da marca: carrinho de mercado desconstruído
e minimalista — cesto trapezoidal geométrico, alça e rodas soltas (desconectadas,
com respiros), e um círculo tangerina "caindo" dentro do carrinho, representando o
item sendo posto na lista. Estilo: flat moderno, formas geométricas arredondadas,
minimalista, amigável. Paleta: verde-esmeralda #0e7a50, gradiente #1fb673→#0c7a4b,
tangerina #ffae4f, off-white #f7f8f3. Evitar: prancheta/clipboard genérico, carrinho
detalhado/realista com grade e hastes, texturas realistas, sombras 3D pesadas, texto
dentro do símbolo.*

1. **Logotipo horizontal** — símbolo à esquerda + wordmark "Põe na Lista" em grotesca
   moderna (peso semibold), verde #0e7a50 sobre fundo transparente. Proporção ~4:1,
   SVG ou PNG 2400×600, variações: positiva, negativa (branca) e monocromática.
2. **Símbolo isolado** — apenas o carrinho desconstruído com o ponto tangerina,
   branco sobre transparente e versão verde sobre transparente. 1:1, SVG + PNG 1024×1024.
3. **Favicon** — símbolo simplificado (cesto + rodas + ponto tangerina, sem alça)
   sobre quadrado arredondado com gradiente verde. 1:1, PNG 48×48 e 32×32, legível em 16px.
4. **Ícone principal do app** — símbolo branco centralizado sobre quadrado de cantos
   arredondados (raio ~23%) com gradiente #1fb673→#0c7a4b. PNG 1024×1024, fundo
   transparente fora dos cantos.
5. **Ícone maskable PWA** — mesma arte, porém fundo preenchendo 100% do quadrado
   (sem cantos transparentes) e símbolo dentro da zona segura central de 80%.
   PNG 1024×1024.
6. **Splash screen** — fundo gradiente esmeralda, símbolo branco centralizado (~25%
   da largura), wordmark discreto abaixo. Variações retrato 1290×2796 e 1179×2556,
   fundo sólido.
7. **Imagem social (OG)** — 1200×630, fundo gradiente esmeralda, símbolo em tile
   translúcido à esquerda, título "Põe na Lista" + subtítulo "Compras da casa:
   lista, gastos e despensa" em branco à direita. PNG.
