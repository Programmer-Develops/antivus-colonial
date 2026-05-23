// ─── Pixi.js v8 renderer ─────────────────────────────────────────────────────
import * as PIXI          from 'pixi.js'
import { useGameStore }   from '../store/gameStore.js'
import { PheromoneLayer } from './pheromoneLayer.js'
import { AntSprites }     from './antSprites.js'
import { MapLayer }       from './mapLayer.js'
import { Camera }         from './camera.js'
import { initInput }      from './input.js'

export let app    = null
let pheromoneLayer, antSprites, mapLayerInst, camera

export async function initRenderer(container) {
  app = new PIXI.Application()

  await app.init({
    resizeTo:        container,
    backgroundColor: 0x0a0a08,
    antialias:       true,
    resolution:      window.devicePixelRatio || 1,
    autoDensity:     true
  })

  container.appendChild(app.canvas)

  // ── World container (everything that moves with the camera) ──────────────
  const world = new PIXI.Container()
  app.stage.addChild(world)

  // ── Layers (bottom → top) ─────────────────────────────────────────────────
  mapLayerInst   = new MapLayer()
  pheromoneLayer = new PheromoneLayer(app)
  antSprites     = new AntSprites()

  world.addChild(mapLayerInst.container)
  world.addChild(pheromoneLayer.container)
  world.addChild(antSprites.container)

  // ── Camera (wraps the world container) ───────────────────────────────────
  camera = new Camera(world, app)

  // ── Input (click, drag, keyboard) ────────────────────────────────────────
  initInput(app, camera)

  // ── Main ticker ───────────────────────────────────────────────────────────
  app.ticker.add((ticker) => {
    const store = useGameStore.getState()
    if (store.phase !== 'playing') return

    const { colonies, myId, dayPhase } = store

    // Dim the world at night
    const targetAlpha = dayPhase === 'night' ? 0.55 : 1.0
    world.alpha += (targetAlpha - world.alpha) * 0.03

    pheromoneLayer.tick(ticker.deltaTime, colonies)
    antSprites.tick(colonies, myId, store.selectedAntIds)
    camera.followQueen(colonies, myId)
  })

  // Resize handler
  window.addEventListener('resize', () => {
    pheromoneLayer.resize()
  })

  console.log('[renderer] Pixi.js v8 ready')
}

export function getApp()    { return app }
export function getCamera() { return camera }