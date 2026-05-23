// ─── game/mapLayer.js — World tile map rendering ──────────────────────────────
import * as PIXI from 'pixi.js'
import { createNoise2D } from 'simplex-noise'

const TILE  = 32
const MAP_W = 64
const MAP_H = 64

const BIOME_COLORS = {
  water:  0x0d2137,
  sand:   0x6b5a3e,
  dirt:   0x2e2318,
  grass:  0x1a3312,
  rock:   0x2a2a2a,
  food:   0x2d4a12
}

// Slightly varied shade per tile for organic look
function shade(base, amount) {
  const r = ((base >> 16) & 0xff) + amount
  const g = ((base >> 8)  & 0xff) + amount
  const b = (base & 0xff) + amount
  return (Math.min(255,Math.max(0,r))<<16) |
         (Math.min(255,Math.max(0,g))<<8)  |
          Math.min(255,Math.max(0,b))
}

export class MapLayer {
  constructor(app, parent) {
    this.app       = app
    this.container = new PIXI.Container()
    parent.addChildAt(this.container, 0)
    this._generated = false
  }

  generate(seed) {
    if (this._generated) return
    this._generated = true

    const noise = createNoise2D(() => seed / 999999)
    const g = new PIXI.Graphics()

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const nx = x / MAP_W
        const ny = y / MAP_H
        const elev = noise(nx * 3, ny * 3) * 0.6
                   + noise(nx * 6, ny * 6) * 0.3
                   + noise(nx * 12, ny * 12) * 0.1
        const moist = noise(nx * 4 + 100, ny * 4 + 100)
        const foodN = noise(nx * 8 + 50,  ny * 8 + 50)

        let biome
        if (elev < -0.45)     biome = 'water'
        else if (elev < -0.1) biome = 'sand'
        else if (moist > 0.3) biome = 'grass'
        else if (elev > 0.4)  biome = 'rock'
        else                   biome = 'dirt'

        if (foodN > 0.72 && biome !== 'water' && biome !== 'rock') biome = 'food'

        const baseColor = BIOME_COLORS[biome]
        const variation  = Math.floor((Math.random() - 0.5) * 12)
        const tileColor  = shade(baseColor, variation)

        g.rect(x * TILE, y * TILE, TILE, TILE).fill({ color: tileColor })

        // Food patches get a lighter dot to mark them
        if (biome === 'food') {
          g.circle(x * TILE + 16, y * TILE + 16, 6)
           .fill({ color: 0x5a8a2a, alpha: 0.8 })
        }
      }
    }

    // Grid lines (subtle)
    g.setStrokeStyle({ width: 0.3, color: 0x000000, alpha: 0.2 })
    for (let x = 0; x <= MAP_W; x++) g.moveTo(x*TILE, 0).lineTo(x*TILE, MAP_H*TILE)
    for (let y = 0; y <= MAP_H; y++) g.moveTo(0, y*TILE).lineTo(MAP_W*TILE, y*TILE)
    g.stroke()

    this.container.addChild(g)
  }
}