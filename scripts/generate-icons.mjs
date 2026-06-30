import { mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const iconsDir = path.join(process.cwd(), "public", "icons")

async function createIcon(filename, size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : 0
  const inner = size - padding * 2

  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#16a34a"/>
      <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${inner * 0.2}" fill="#ffffff"/>
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="${inner * 0.45}" font-weight="700" fill="#16a34a">P</text>
    </svg>
  `

  await sharp(Buffer.from(svg)).png().toFile(path.join(iconsDir, filename))
}

async function main() {
  await mkdir(iconsDir, { recursive: true })
  await createIcon("icon-192.png", 192)
  await createIcon("icon-512.png", 512)
  await createIcon("icon-maskable-512.png", 512, true)
  console.log("Ícones PWA gerados em public/icons/")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
