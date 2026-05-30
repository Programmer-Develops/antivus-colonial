// ─── mapLayer.js — Rich procedural terrain ───────────────────────────────────
import * as PIXI from 'pixi.js'
import { createNoise2D } from 'simplex-noise'

const TILE  = 32
const MAP_W = 64
const MAP_H = 64

export class MapLayer {
  constructor(app, parent) {
    this.app        = app
    this.container  = new PIXI.Container()
    parent.addChildAt(this.container, 0)
    this._done = false
  }

  generate(seed) {
    if (this._done) return
    this._done = true

    const n1 = createNoise2D(seededRandom(seed))
    const n2 = createNoise2D(seededRandom(seed + 7919))

    const base    = new PIXI.Graphics()
    const details = new PIXI.Graphics()
    const food    = new PIXI.Graphics()

    for (let ty = 0; ty < MAP_H; ty++) {
      for (let tx = 0; tx < MAP_W; tx++) {
        const nx = tx / MAP_W
        const ny = ty / MAP_H
        const px = tx * TILE
        const py = ty * TILE

        const elev  = n1(nx*3, ny*3)*0.5 + n1(nx*7, ny*7)*0.3 + n1(nx*14, ny*14)*0.2
        const moist = n2(nx*4, ny*4)*0.6 + n2(nx*10, ny*10)*0.4
        const foodN = n1(nx*9 + 40, ny*9 + 40)
        const var_  = n2(nx*20, ny*20) * 0.5 + 0.5

        let biome
        if      (elev < -0.42) biome = 'water'
        else if (elev < -0.12) biome = 'sand'
        else if (moist > 0.22) biome = 'grass'
        else if (elev > 0.36)  biome = 'rock'
        else                    biome = 'dirt'

        // MORE food patches — lower threshold so workers can actually find them
        const isFood = foodN > 0.55 && biome !== 'water' && biome !== 'rock'
        if (isFood) biome = 'food'

        const baseColor = BIOME[biome].base
        const darkColor = BIOME[biome].dark
        const tileColor = blendHex(darkColor, baseColor, var_)

        base.rect(px, py, TILE, TILE).fill({ color: tileColor })

        // Per-biome micro details
        if (biome === 'grass' && Math.random() > 0.55) {
          for (let b = 0; b < 3; b++) {
            const bx = px + 4 + Math.random() * 24
            const by = py + 4 + Math.random() * 24
            details.moveTo(bx, by + 5).lineTo(bx + 1, by).stroke({ color: 0x3a7020, width: 1.5, alpha: 0.6 })
          }
        }
        if (biome === 'rock' && Math.random() > 0.6) {
          details.rect(px + 6, py + 6, TILE - 12, 2).fill({ color: 0x1a1a1a, alpha: 0.4 })
        }
        if (biome === 'water') {
          details.rect(px, py + 8, TILE, 1.5).fill({ color: 0x1a5070, alpha: 0.35 })
          details.rect(px, py + 20, TILE, 1.5).fill({ color: 0x1a5070, alpha: 0.2 })
        }
        if (biome === 'dirt' && Math.random() > 0.7) {
          details.circle(px + Math.random()*26 + 3, py + Math.random()*26 + 3, 2)
            .fill({ color: 0x5a4030, alpha: 0.5 })
        }
        if (isFood) {
          // Bright glowing food patches — easy to spot
          food.circle(px + 16, py + 16, 9).fill({ color: 0x6abf30, alpha: 0.85 })
          food.circle(px + 16, py + 16, 5).fill({ color: 0xb0ff50, alpha: 0.9 })
          food.circle(px + 16, py + 16, 2).fill({ color: 0xffffff, alpha: 0.6 })
        }
      }
    }

    // Edge vignette
    const edge = new PIXI.Graphics()
    for (let i = 0; i < 3; i++) {
      const a = 0.25 - i * 0.07
      edge.rect(i*TILE, i*TILE, (MAP_W-i*2)*TILE, TILE).fill({ color: 0x000000, alpha: a })
      edge.rect(i*TILE, (MAP_H-1-i)*TILE, (MAP_W-i*2)*TILE, TILE).fill({ color: 0x000000, alpha: a })
      edge.rect(i*TILE, i*TILE, TILE, (MAP_H-i*2)*TILE).fill({ color: 0x000000, alpha: a })
      edge.rect((MAP_W-1-i)*TILE, i*TILE, TILE, (MAP_H-i*2)*TILE).fill({ color: 0x000000, alpha: a })
    }

    // Subtle grid
    const grid = new PIXI.Graphics()
    grid.setStrokeStyle({ width: 0.4, color: 0x000000, alpha: 0.1 })
    for (let x = 0; x <= MAP_W; x++) grid.moveTo(x*TILE, 0).lineTo(x*TILE, MAP_H*TILE)
    for (let y = 0; y <= MAP_H; y++) grid.moveTo(0, y*TILE).lineTo(MAP_W*TILE, y*TILE)
    grid.stroke()

    this.container.addChild(base)
    this.container.addChild(details)
    this.container.addChild(food)
    this.container.addChild(edge)
    this.container.addChild(grid)

    console.log('[mapLayer] generated with seed', seed)
  }
}

const BIOME = {
  water: { base: 0x0d2a45, dark: 0x081828 },
  sand:  { base: 0x8a7250, dark: 0x614e34 },
  dirt:  { base: 0x3d2e1e, dark: 0x251c10 },
  grass: { base: 0x2a5a18, dark: 0x19380e },
  rock:  { base: 0x3e3e3e, dark: 0x252525 },
  food:  { base: 0x2d5a10, dark: 0x1a3808 }
}

function blendHex(a, b, t) {
  const r1=(a>>16)&255, g1=(a>>8)&255, b1=a&255
  const r2=(b>>16)&255, g2=(b>>8)&255, b2=b&255
  const r = Math.round(r1+(r2-r1)*t)
  const g = Math.round(g1+(g2-g1)*t)
  const bl= Math.round(b1+(b2-b1)*t)
  return (r<<16)|(g<<8)|bl
}

// Seeded PRNG so same seed = same map every time
function seededRandom(seed) {
  let s = seed | 0
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}