// ─── Pheromone trail system using Pixi RenderTexture ─────────────────────────
// Each colony has its own RenderTexture. Each frame we:
//   1. Slightly fade the whole texture (trail decay)
//   2. Draw a dot at each ant's position in the colony color
// The result is living, decaying pheromone trails.
import * as PIXI from 'pixi.js'

const DECAY_ALPHA = 0.012   // how fast trails fade per frame
const DOT_RADIUS  = 3       // trail dot size in world pixels

export class PheromoneLayer {
  constructor(app) {
    this.app = app
    this.container = new PIXI.Container()
    this.textures = {}    // { [playerId]: PIXI.RenderTexture }
    this.sprites  = {}    // { [playerId]: PIXI.Sprite }
    this.graphics = new PIXI.Graphics()
  }

  // Ensure a RenderTexture exists for a given player
  _ensureTexture(playerId) {
    if (this.textures[playerId]) return
    const { width, height } = this.app.screen
    const rt = PIXI.RenderTexture.create({ width, height })
    const sprite = new PIXI.Sprite(rt)
    sprite.alpha = 0.65
    this.textures[playerId] = rt
    this.sprites[playerId]  = sprite
    this.container.addChild(sprite)
  }

  tick(delta, colonies) {
    if (!colonies) return

    for (const [playerId, colony] of Object.entries(colonies)) {
      if (!colony.ants || !colony.color) continue
      this._ensureTexture(playerId, colony.color)

      const rt = this.textures[playerId]
      const g  = this.graphics
      g.clear()

      // Fade the existing texture
      const fadeRect = new PIXI.Graphics()
        .rect(0, 0, rt.width, rt.height)
        .fill({ color: 0x000000, alpha: DECAY_ALPHA })
      this.app.renderer.render({ container: fadeRect, target: rt, clear: false })

      // Draw a dot for each ant
      const colorNum = parseInt(colony.color.replace('#', ''), 16)
      for (const ant of Object.values(colony.ants)) {
        if (!ant.position) continue
        g.circle(ant.position.x, ant.position.y, DOT_RADIUS)
         .fill({ color: colorNum, alpha: 0.9 })
      }
      this.app.renderer.render({ container: g, target: rt, clear: false })
    }
  }

  resize() {
    // Clear all textures on resize — they'll be recreated next tick
    for (const rt of Object.values(this.textures)) rt.destroy()
    this.textures = {}
    this.sprites  = {}
    this.container.removeChildren()
  }
}