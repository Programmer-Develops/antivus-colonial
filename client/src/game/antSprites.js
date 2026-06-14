// ─── game/antSprites.js — Premium Shooter Ant Vector Rendering ───────────────
import * as PIXI from 'pixi.js'

const CASTE_CFG = {
  worker:     { size: 7.5, shape: 'circle'   },
  soldier:    { size: 12.0,shape: 'square'   },
  scout:      { size: 6.5, shape: 'triangle' },
  ranger:     { size: 8.5, shape: 'cross'    },
  farmer:     { size: 8.0, shape: 'circle'   },
  bombardier: { size: 13.5,shape: 'diamond'  },
  weaver:     { size: 10.5,shape: 'square'   },
  bullet:     { size: 8.5, shape: 'triangle' },
  stinkbug:   { size: 11.5,shape: 'circle'   },
  acidgunner: { size: 10.0,shape: 'cross'    },
  sniper:     { size: 8.0, shape: 'triangle' },
  cultivator: { size: 10.0,shape: 'diamond'  }
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
      const invul    = colony.invulnerableTimer > 0

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

        // Draw ant body
        this._drawShape(g, cfg.shape, cfg.size, colorNum)

        // Draw double rings around local player ant
        if (isMe && ant.isPlayer) {
          g.circle(0, 0, cfg.size + 3.5)
           .stroke({ color: 0xffffff, width: 2.0, alpha: 0.78 })
          g.circle(0, 0, cfg.size + 7.5)
           .stroke({ color: colorNum, width: 1.0, alpha: 0.35 })
        }

        // Draw pulsing gold shield ring around player if invulnerable
        if (ant.isPlayer && invul) {
          const time = Date.now() * 0.015
          const pulseR = cfg.size + 10 + Math.sin(time) * 3
          g.circle(0, 0, pulseR)
           .stroke({ color: 0xfacc15, width: 2.2, alpha: 0.85 })
        }

        // Draw outline on follower AI mini-drones
        if (!ant.isPlayer) {
          g.circle(0, 0, cfg.size + 2.5)
           .stroke({ color: colorNum, width: 1.2, alpha: 0.55 })
        }

        // HP bar for damaged ants
        if (ant.hp < ant.maxHp && ant.maxHp > 0) {
          const pct  = ant.hp / ant.maxHp
          const barW = cfg.size * 2.2
          g.rect(-barW/2, -(cfg.size + 7), barW, 3)
           .fill({ color: 0x222222 })
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
        g.poly([0,-size * 1.2, size,0, 0,size * 1.2, -size,0]).fill({ color })
        break
      case 'square':
        g.rect(-size/2, -size/2, size, size).fill({ color })
        break
      case 'triangle':
        g.poly([0,-size * 1.2, size,size * 0.8, -size,size * 0.8]).fill({ color })
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