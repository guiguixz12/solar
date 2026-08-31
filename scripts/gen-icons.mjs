import { PNG } from 'pngjs'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '../public/icons')
mkdirSync(iconsDir, { recursive: true })

function lerp(a, b, t) { return a + (b - a) * t }

function drawIcon(size) {
  const png = new PNG({ width: size, height: size, filterType: -1 })
  const cx = size / 2, cy = size / 2
  const radius = size * 0.16
  const rayLen = size * 0.12
  const rayGap = size * 0.06
  const cornerR = size * 0.2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      // Background: #0f172a (dark slate)
      let r = 15, g = 23, b = 42, a = 255

      // Rounded rect mask (corner radius)
      const dx = Math.max(0, Math.abs(x - cx) - (size / 2 - cornerR))
      const dy = Math.max(0, Math.abs(y - cy) - (size / 2 - cornerR))
      if (dx * dx + dy * dy > cornerR * cornerR) {
        a = 0
      }

      png.data[idx]     = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = a
    }
  }

  // Draw amber circle (sun body) — anti-aliased
  const sunR = radius
  const stroke = size * 0.045
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      if (png.data[idx + 3] === 0) continue
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const inner = sunR - stroke / 2
      const outer = sunR + stroke / 2
      let t = 0
      if (dist >= inner - 1 && dist <= outer + 1) {
        t = Math.min(1, Math.min(dist - (inner - 1), (outer + 1) - dist))
        // #fbbf24 amber
        png.data[idx]     = Math.round(lerp(png.data[idx], 251, t))
        png.data[idx + 1] = Math.round(lerp(png.data[idx + 1], 191, t))
        png.data[idx + 2] = Math.round(lerp(png.data[idx + 2], 36, t))
      }
    }
  }

  // Draw 8 sun rays
  const rayW = stroke * 0.9
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    const startR = sunR + rayGap
    const endR = startR + rayLen
    const cos = Math.cos(angle), sin = Math.sin(angle)
    const perpX = -sin, perpY = cos

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4
        if (png.data[idx + 3] === 0) continue
        const lx = x - cx, ly = y - cy
        const along = lx * cos + ly * sin
        const perp = Math.abs(lx * perpX + ly * perpY)
        if (along >= startR - 1 && along <= endR + 1 && perp <= rayW / 2 + 1) {
          const t = Math.min(1,
            Math.min(along - (startR - 1), (endR + 1) - along),
            Math.min(1, (rayW / 2 + 1) - perp)
          )
          png.data[idx]     = Math.round(lerp(png.data[idx], 251, t))
          png.data[idx + 1] = Math.round(lerp(png.data[idx + 1], 191, t))
          png.data[idx + 2] = Math.round(lerp(png.data[idx + 2], 36, t))
        }
      }
    }
  }

  return PNG.sync.write(png)
}

const sizes = [192, 512]
for (const size of sizes) {
  const buf = drawIcon(size)
  const path = join(iconsDir, `icon-${size}.png`)
  writeFileSync(path, buf)
  console.log(`Created ${path}`)
}
