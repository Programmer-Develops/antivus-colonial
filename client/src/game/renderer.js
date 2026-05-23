import * as PIXI from 'pixi.js'
import { useGameStore }   from '../store/gameStore.js'
import { PheromoneLayer } from './pheromoneLayer.js'
import { AntSprites }     from './antSprites.js'
import { MapLayer }       from './mapLayer.js'
import { initInput }      from './input.js'

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

  camera = new PIXI.Container()
  app.stage.addChild(camera)

  const mapLayer       = new MapLayer(app, camera)
  const pheromoneLayer = new PheromoneLayer(app, camera)
  const antSprites     = new AntSprites(app, camera)

  initInput(app, camera)

  // Generate map + center camera on MY spawn when seed arrives
  useGameStore.subscribe(
    (s) => s.mapSeed,
    (seed) => {
      if (!seed) return
      mapLayer.generate(seed)
      // Center camera on top-left spawn area (200,200) with some padding
      const zoom = 1.5
      camera.scale.set(zoom)
      camera.x = app.screen.width  / 2 - 200 * zoom
      camera.y = app.screen.height / 2 - 200 * zoom
    }
  )

  app.ticker.add((ticker) => {
    const { phase, colonies, myId, dayPhase } = useGameStore.getState()
    if (phase !== 'playing') return
    const targetAlpha = dayPhase === 'night' ? 0.45 : 1
    camera.alpha += (targetAlpha - camera.alpha) * 0.02
    pheromoneLayer.tick(ticker.deltaTime, colonies)
    antSprites.tick(colonies, myId)
  })

  window.addEventListener('resize', () => app.resize())
  console.log('[renderer] Pixi.js v8 ready')
  return app
}