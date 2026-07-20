import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const publicDir = path.join(process.cwd(), "public")
const iconsDir = path.join(publicDir, "icons")
const sourceDir = path.join(iconsDir, "_source")

/**
 * Símbolo da marca "Põe na Lista": carrinho de mercado desconstruído —
 * cesto geométrico, alça e rodas soltas, e um ponto tangerina "caindo"
 * no carrinho (o item sendo posto na lista). Gradiente esmeralda.
 * Mesma geometria de src/components/common/app-logo.tsx.
 */
const GRADIENT = `
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#1fb673"/>
    <stop offset="1" stop-color="#0c7a4b"/>
  </linearGradient>
`

const MARK = `
  <g>
    <path d="M112 118 L192 154" fill="none" stroke="#ffffff" stroke-width="32" stroke-linecap="round"/>
    <path d="M150 192 L394 192 L354 352 L192 352 Z" fill="#ffffff" stroke="#ffffff" stroke-width="28" stroke-linejoin="round"/>
    <circle cx="224" cy="414" r="26" fill="#ffffff"/>
    <circle cx="330" cy="414" r="26" fill="#ffffff"/>
    <circle cx="330" cy="112" r="30" fill="#ffae4f"/>
  </g>
`

// Ícone padrão: cantos arredondados transparentes (estilo app icon).
function appIconSvg(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <title>Põe na Lista</title>
      <defs>${GRADIENT}</defs>
      <rect width="512" height="512" rx="120" fill="url(#g)"/>
      ${MARK}
    </svg>
  `
}

// Maskable: fundo sólido até a borda, símbolo dentro da zona segura (80%).
function maskableIconSvg(size) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>${GRADIENT}</defs>
      <rect width="512" height="512" fill="url(#g)"/>
      <g transform="translate(256 256) scale(0.72) translate(-256 -256)">${MARK}</g>
    </svg>
  `
}

// Imagem de compartilhamento social (1200x630).
function ogImageSvg() {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>${GRADIENT}</defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <g transform="translate(120 179) scale(0.53)">
        <rect width="512" height="512" rx="120" fill="#ffffff" fill-opacity="0.12"/>
        ${MARK}
      </g>
      <text x="450" y="300" font-family="DejaVu Sans, Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff">Põe na Lista</text>
      <text x="452" y="366" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="400" fill="#ffffff" fill-opacity="0.85">Compras da casa: lista, gastos e despensa</text>
    </svg>
  `
}

async function render(svg, filePath, width, height = width) {
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(filePath)
  console.log(`Gerado: ${path.relative(publicDir, filePath)} (${width}x${height})`)
}

async function main() {
  await mkdir(iconsDir, { recursive: true })
  await mkdir(sourceDir, { recursive: true })

  await render(appIconSvg(48), path.join(iconsDir, "favicon.png"), 48)
  await render(appIconSvg(192), path.join(iconsDir, "icon-192.png"), 192)
  await render(appIconSvg(512), path.join(iconsDir, "icon-512.png"), 512)
  await render(maskableIconSvg(512), path.join(iconsDir, "icon-maskable-512.png"), 512)
  await render(ogImageSvg(), path.join(publicDir, "og-image.png"), 1200, 630)

  // Mantém as fontes usadas por icons:resize alinhadas à marca atual.
  await render(appIconSvg(1024), path.join(sourceDir, "icon.png"), 1024)
  await render(maskableIconSvg(1024), path.join(sourceDir, "icon-maskable.png"), 1024)

  // SVG de referência da marca (símbolo isolado).
  await writeFile(path.join(sourceDir, "mark.svg"), appIconSvg(512).trim())

  console.log("Assets da marca gerados em public/")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
