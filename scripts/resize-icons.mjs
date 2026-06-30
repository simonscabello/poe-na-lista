import { access, copyFile, mkdir } from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const iconsDir = path.join(process.cwd(), "public", "icons")
const sourceDir = path.join(iconsDir, "_source")

async function ensureSource(filename, fallback) {
  const sourcePath = path.join(sourceDir, filename)

  try {
    await access(sourcePath)
  } catch {
    await mkdir(sourceDir, { recursive: true })
    await copyFile(path.join(iconsDir, fallback), sourcePath)
    console.log(`Backup: ${fallback} → _source/${filename}`)
  }

  return sourcePath
}

async function resizeIcon(input, output, size) {
  await sharp(input)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(iconsDir, output))

  console.log(`Gerado: ${output} (${size}x${size})`)
}

async function main() {
  const source = await ensureSource("icon.png", "icon-512.png")
  const sourceMaskable = await ensureSource("icon-maskable.png", "icon-maskable-512.png")

  await resizeIcon(source, "favicon.png", 48)
  await resizeIcon(source, "icon-192.png", 192)
  await resizeIcon(source, "icon-512.png", 512)
  await resizeIcon(sourceMaskable, "icon-maskable-512.png", 512)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
