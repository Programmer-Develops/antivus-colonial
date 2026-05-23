// ─── game/renderer.js — Pixi.js v8 app + main ticker ─────────────────────────
import * as PIXI from 'pixi.js'
import { useGameStore }    from '../store/gameStore.js'
import { PheromoneLayer }  from './pheromoneLayer.js'
import { AntSprites }      from './antSprites.js'
import { MapLayer }        from './mapLayer.js'
import { initInput }       from './input.js'

export let app    = null
export let camera = null

export async function initRenderer(container) {
  app = new PIXI.Application()

  await app.init({
    resizeTo:        container,
    backgroundColor: 0x070705,
    antialias:       true,
    resolution:      Math.min(window.devicePixelRatio || 1, 2),
    autoDensity:     true
  })

  container.appendChild(app.canvas)

  // Camera container — all game-world objects live inside this
  camera = new PIXI.Container()
  app.stage.addChild(camera)

  // Layer order (bottom → top): map → pheromones → ants
  const mapLayer       = new MapLayer(app, camera)
  const pheromoneLayer = new PheromoneLayer(app, camera)
  const antSprites     = new AntSprites(app, camera)

  // Click / pan / zoom input
  initInput(app, camera)

  // Generate map when seed arrives from server
  useGameStore.subscribe(
    (s) => s.mapSeed,
    (seed) => { if (seed) mapLayer.generate(seed) }
  )

  // Main ticker — runs every frame
  app.ticker.add((ticker) => {
    const { phase, colonies, myId, dayPhase } = useGameStore.getState()
    if (phase !== 'playing') return

    // Smoothly dim screen at night
    const targetAlpha = dayPhase === 'night' ? 0.45 : 1
    camera.alpha += (targetAlpha - camera.alpha) * 0.02

    pheromoneLayer.tick(ticker.deltaTime, colonies)
    antSprites.tick(colonies, myId)
  })

  window.addEventListener('resize', () => app.resize())

  console.log('[renderer] Pixi.js v8 ready')
  return app
}