// ─── pheromoneLayer.js — GPU pheromone trails ────────────────────────────────
// Draws colored dots at each ant's world position onto a per-colony
// RenderTexture that slowly fades each frame. Scouts leave no trail.
import * as PIXI from 'pixi.js'

const MAP_PX     = 64 * 32   // 2048 — trail texture is world-sized, not screen-sized
const MAP_PY     = 64 * 32
const DOT_R      = 3
const FADE_ALPHA = 0.006      // lower = longer trails

export class PheromoneLayer {
  constructor(app, parent) {
    this.app       = app
    this.container = new PIXI.Container()
    this.container.alpha = 0.65
    // Pheromones sit above map but below ants
    parent.addChildAt(this.container, 1)

    this._rt      = {}   // playerId → RenderTexture (world-sized)
    this._sprite  = {}   // playerId → Sprite
    this._dots    = new PIXI.Graphics()
    this._fade    = new PIXI.Graphics()

    // Pre-draw the fade rect at world size once
    this._fade.rect(0, 0, MAP_PX, MAP_PY)
      .fill({ color: 0x000000, alpha: FADE_ALPHA })
  }

  _ensure(pid) {
    if (this._rt[pid]) return

    // Create texture at WORLD size — it renders in world space
    const rt = PIXI.RenderTexture.create({ width: MAP_PX, height: MAP_PY })
    const sp = new PIXI.Sprite(rt)
    sp.blendMode = 'add'

    this._rt[pid]     = rt
    this._sprite[pid] = sp
    this.container.addChild(sp)
  }

  tick(delta, colonies) {
    if (!colonies) return

    for (const [pid, colony] of Object.entries(colonies)) {
      if (!colony?.ants || !colony?.color) continue
      this._ensure(pid)

      const rt    = this._rt[pid]
      const color = parseInt(colony.color.replace('#', ''), 16)

      // 1. Fade existing trails
      this.app.renderer.render({ container: this._fade, target: rt, clear: false })

      // 2. Draw new dots at each ant's world position
      this._dots.clear()
      for (const ant of Object.values(colony.ants)) {
        if (!ant?.position) continue
        if (ant.caste === 'scout') continue  // scouts leave no trail
        this._dots
          .circle(ant.position.x, ant.position.y, DOT_R)
          .fill({ color, alpha: 0.8 })
      }
      this.app.renderer.render({ container: this._dots, target: rt, clear: false })
    }

    // Remove sprites for players who left
    for (const pid of Object.keys(this._rt)) {
      if (!colonies[pid]) {
        this.container.removeChild(this._sprite[pid])
        this._rt[pid].destroy(true)
        delete this._rt[pid]
        delete this._sprite[pid]
      }
    }
  }
}