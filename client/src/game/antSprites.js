// ─── game/antSprites.js — Ant rendering with Graphics shapes ─────────────────
// Uses PIXI.Graphics until real sprite assets are added.
// Each caste has a distinct shape + size so they're readable at a glance.
import * as PIXI from 'pixi.js'

const CASTE_CFG = {
  queen:      { size: 14, shape: 'diamond' },
  worker:     { size: 6,  shape: 'circle'  },
  soldier:    { size: 10, shape: 'square'  },
  scout:      { size: 5,  shape: 'triangle'},
  builder:    { size: 7,  shape: 'circle'  },
  ranger:     { size: 7,  shape: 'cross'   },
  farmer:     { size: 6,  shape: 'circle'  },
  bombardier: { size: 9,  shape: 'diamond' }
}

export class AntSprites {
  constructor(app, parent) {
    this.app       = app
    this.container = new PIXI.Container()
    parent.addChild(this.container)
    this._pool = {}   // antId → PIXI.Graphics
  }

  tick(colonies, myId) {
    const alive = new Set()

    for (const [pid, colony] of Object.entries(colonies || {})) {
      if (!colony?.ants) continue
      const isMe     = pid === myId
      const colorHex = colony.color || '#888888'
      const colorNum = parseInt(colorHex.replace('#', ''), 16)

      for (const [antId, ant] of Object.entries(colony.ants)) {
        alive.add(antId)

        let g = this._pool[antId]
        if (!g) {
          g = new PIXI.Graphics()
          this._pool[antId] = g
          this.container.addChild(g)
        }

        g.clear()
        const cfg = CASTE_CFG[ant.caste] ?? CASTE_CFG.worker
        this._drawShape(g, cfg.shape, cfg.size, colorNum)

        // White ring for own colony
        if (isMe) {
          g.circle(0, 0, cfg.size + 2.5)
           .stroke({ color: 0xffffff, width: 1.5, alpha: 0.6 })
        }

        // HP bar for damaged ants
        if (ant.hp < ant.maxHp && ant.maxHp > 0) {
          const pct  = ant.hp / ant.maxHp
          const barW = 14
          g.rect(-barW/2, -(cfg.size + 7), barW, 3)
           .fill({ color: 0x333333 })
          g.rect(-barW/2, -(cfg.size + 7), barW * pct, 3)
           .fill({ color: pct > 0.5 ? 0x4ade80 : pct > 0.25 ? 0xf59e0b : 0xef4444 })
        }

        if (ant.position) {
          g.x = ant.position.x
          g.y = ant.position.y
        }
        g.visible = true
      }
    }

    // Hide pooled graphics for ants that are gone
    for (const [antId, g] of Object.entries(this._pool)) {
      if (!alive.has(antId)) g.visible = false
    }
  }

  _drawShape(g, shape, size, color) {
    switch (shape) {
      case 'circle':
        g.circle(0, 0, size).fill({ color })
        break
      case 'diamond':
        g.poly([0,-size, size,0, 0,size, -size,0]).fill({ color })
        break
      case 'square':
        g.rect(-size/2, -size/2, size, size).fill({ color })
        break
      case 'triangle':
        g.poly([0,-size, size,size/1.5, -size,size/1.5]).fill({ color })
        break
      case 'cross': {
        const t = size * 0.35
        g.rect(-size/2, -t/2, size, t).fill({ color })
        g.rect(-t/2, -size/2, t, size).fill({ color })
        break
      }
    }
  }
}