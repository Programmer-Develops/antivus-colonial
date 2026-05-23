import * as PIXI from 'pixi.js'
import { createNoise2D } from 'simplex-noise'

const TILE  = 32
const MAP_W = 64
const MAP_H = 64

const BIOME = {
  water: { base: 0x0d2137, dark: 0x091828 },
  sand:  { base: 0x7a6545, dark: 0x5c4a30 },
  dirt:  { base: 0x3d2e1e, dark: 0x2a1f12 },
  grass: { base: 0x254a18, dark: 0x1a3310 },
  rock:  { base: 0x3a3a3a, dark: 0x252525 },
  food:  { base: 0x2d5a12, dark: 0x1e3d0a }
}

function lerp(a, b, t) { return a + (b - a) * t }

function blendColor(hex1, hex2, t) {
  const r1=(hex1>>16)&255, g1=(hex1>>8)&255, b1=hex1&255
  const r2=(hex2>>16)&255, g2=(hex2>>8)&255, b2=hex2&255
  return (Math.round(lerp(r1,r2,t))<<16)|(Math.round(lerp(g1,g2,t))<<8)|Math.round(lerp(b1,b2,t))
}

export class MapLayer {
  constructor(app, parent) {
    this.app        = app
    this.container  = new PIXI.Container()
    parent.addChildAt(this.container, 0)
    this._generated = false
  }

  generate(seed) {
    if (this._generated) return
    this._generated = true

    const noise   = createNoise2D(() => seed / 999999)
    const noiseB  = createNoise2D(() => (seed + 1337) / 999999)
    const g       = new PIXI.Graphics()
    const overlay = new PIXI.Graphics()  // for food/special markers

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const nx = x / MAP_W
        const ny = y / MAP_H

        // Layered noise for natural terrain
        const elev  = noise(nx*3,ny*3)*0.5 + noise(nx*7,ny*7)*0.3 + noise(nx*15,ny*15)*0.2
        const moist = noiseB(nx*4,ny*4)*0.6 + noiseB(nx*9,ny*9)*0.4
        const foodN = noise(nx*8+50, ny*8+50)
        const detail= noise(nx*20, ny*20) * 0.5 + 0.5  // 0-1 for shading

        let biome
        if      (elev < -0.45)   biome = 'water'
        else if (elev < -0.15)   biome = 'sand'
        else if (moist > 0.25)   biome = 'grass'
        else if (elev > 0.38)    biome = 'rock'
        else                      biome = 'dirt'

        const isFood = foodN > 0.70 && biome !== 'water' && biome !== 'rock'
        if (isFood) biome = 'food'

        const { base, dark } = BIOME[biome]
        const tileColor = blendColor(dark, base, detail)

        const px = x * TILE
        const py = y * TILE

        g.rect(px, py, TILE, TILE).fill({ color: tileColor })

        // Texture details
        if (biome === 'grass') {
          // Random grass blades
          if (Math.random() > 0.6) {
            const gc = blendColor(0x1a3310, 0x3a7020, Math.random())
            g.rect(px + Math.random()*28, py + Math.random()*28, 2, 4).fill({ color: gc })
          }
        }
        if (biome === 'rock') {
          // Rock cracks
          if (Math.random() > 0.5) {
            g.rect(px + 8, py + 4, 14, 1).fill({ color: 0x1a1a1a, alpha: 0.6 })
          }
        }
        if (biome === 'water') {
          // Shimmer lines
          if (y % 3 === 0) {
            g.rect(px, py + 10, TILE, 2).fill({ color: 0x1a4a6a, alpha: 0.4 })
          }
        }
        if (biome === 'dirt') {
          // Pebbles
          if (Math.random() > 0.75) {
            const pc = blendColor(0x2a1f12, 0x5a4030, Math.random())
            g.circle(px + Math.random()*28+2, py + Math.random()*28+2, 2)
             .fill({ color: pc })
          }
        }

        // Food patch markers — glowing green dots
        if (isFood) {
          overlay.circle(px + 16, py + 16, 7).fill({ color: 0x6abf30, alpha: 0.9 })
          overlay.circle(px + 16, py + 16, 4).fill({ color: 0x9eff50, alpha: 0.7 })
        }
      }
    }

    // Border edge darkening
    for (let x = 0; x < MAP_W; x++) {
      g.rect(x*TILE, 0, TILE, TILE).fill({ color: 0x000000, alpha: 0.4 })
      g.rect(x*TILE, (MAP_H-1)*TILE, TILE, TILE).fill({ color: 0x000000, alpha: 0.4 })
    }
    for (let y = 0; y < MAP_H; y++) {
      g.rect(0, y*TILE, TILE, TILE).fill({ color: 0x000000, alpha: 0.4 })
      g.rect((MAP_W-1)*TILE, y*TILE, TILE, TILE).fill({ color: 0x000000, alpha: 0.4 })
    }

    // Subtle grid
    g.setStrokeStyle({ width: 0.5, color: 0x000000, alpha: 0.12 })
    for (let x = 0; x <= MAP_W; x++) g.moveTo(x*TILE,0).lineTo(x*TILE,MAP_H*TILE)
    for (let y = 0; y <= MAP_H; y++) g.moveTo(0,y*TILE).lineTo(MAP_W*TILE,y*TILE)
    g.stroke()

    this.container.addChild(g)
    this.container.addChild(overlay)
  }
}