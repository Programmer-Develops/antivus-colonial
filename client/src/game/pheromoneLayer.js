// ─── game/pheromoneLayer.js — GPU pheromone trail decay ──────────────────────
// Each colony gets a RenderTexture. Each tick:
//   1. Draw a faint black rect over it (= trail decay)
//   2. Draw colored dots at each ant's position (= new trail)
// Result: living trails that fade naturally over ~8 seconds.
import * as PIXI from 'pixi.js'

const DECAY_ALPHA = 0.008   // lower = trails last longer
const DOT_RADIUS  = 4

export class PheromoneLayer {
  constructor(app, parent) {
    this.app       = app
    this.container = new PIXI.Container()
    this.container.alpha = 0.7
    parent.addChildAt(this.container, 0)

    this._textures = {}   // playerId → RenderTexture
    this._sprites  = {}   // playerId → Sprite
    this._g        = new PIXI.Graphics()
  }

  _ensure(playerId) {
    if (this._textures[playerId]) return
    const { width, height } = this.app.screen
    const rt = PIXI.RenderTexture.create({ width, height })

    const sprite = new PIXI.Sprite(rt)
    sprite.blendMode = 'add'
    this._textures[playerId] = rt
    this._sprites[playerId]  = sprite
    this.container.addChild(sprite)
  }

  tick(delta, colonies) {
    if (!colonies) return

    for (const [pid, colony] of Object.entries(colonies)) {
      if (!colony?.ants || !colony?.color) continue
      this._ensure(pid, colony.color)

      const rt    = this._textures[pid]
      const g     = this._g
      const color = parseInt(colony.color.replace('#', ''), 16)

      // Fade existing trail
      const fade = new PIXI.Graphics()
        .rect(0, 0, rt.width, rt.height)
        .fill({ color: 0x000000, alpha: DECAY_ALPHA * delta })
      this.app.renderer.render({ container: fade, target: rt, clear: false })

      // Paint new dots at each ant position
      g.clear()
      for (const ant of Object.values(colony.ants)) {
        if (!ant?.position) continue
        // Scouts leave no trail (stealth mechanic)
        if (ant.caste === 'scout') continue
        g.circle(ant.position.x, ant.position.y, DOT_RADIUS)
         .fill({ color, alpha: 0.85 })
      }
      this.app.renderer.render({ container: g, target: rt, clear: false })
    }
  }

  // Call on window resize — recreate textures at new size
  resize() {
    for (const rt of Object.values(this._textures)) rt.destroy(true)
    this._textures = {}
    this.container.removeChildren()
    this._sprites = {}
  }
}