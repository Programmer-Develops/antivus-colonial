// ─── Procedural map generator using simplex noise ────────────────────────────
import { createNoise2D } from 'simplex-noise'

const MAP_W = 64   // tiles wide
const MAP_H = 64   // tiles tall

export function generateMap(seed) {
  const noise2D = createNoise2D(() => seed / 999999)
  const tiles   = []

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const nx = x / MAP_W
      const ny = y / MAP_H

      const elevation = (
        noise2D(nx * 3, ny * 3) * 0.6 +
        noise2D(nx * 6, ny * 6) * 0.3 +
        noise2D(nx * 12, ny * 12) * 0.1
      )

      const moisture = noise2D(nx * 4 + 100, ny * 4 + 100)

      let biome
      if (elevation < -0.4)        biome = 'water'
      else if (elevation < -0.1)   biome = 'sand'
      else if (moisture > 0.3)     biome = 'grass'
      else if (elevation > 0.4)    biome = 'rock'
      else                          biome = 'dirt'

      // Food patches scattered across map
      const foodNoise = noise2D(nx * 8 + 50, ny * 8 + 50)
      if (foodNoise > 0.7 && biome !== 'water') biome = 'food'

      tiles.push({ x, y, biome, walkable: biome !== 'water' && biome !== 'rock' })
    }
  }

  return { width: MAP_W, height: MAP_H, tiles, seed }
}