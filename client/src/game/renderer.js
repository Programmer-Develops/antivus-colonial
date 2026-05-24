import * as PIXI from 'pixi.js'
import { useGameStore }   from '../store/gameStore.js'
import { PheromoneLayer } from './pheromoneLayer.js'
import { AntSprites }     from './antSprites.js'
import { MapLayer }       from './mapLayer.js'
import { initInput }      from './input.js'

export let app    = null
export let camera = null

let territoryGfx   = null
let chamberGfx     = null
let chamberLabels  = null   // PIXI container for text labels
let labelContainer = null

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

  territoryGfx = new PIXI.Graphics()
  camera.addChild(territoryGfx)

  chamberGfx = new PIXI.Graphics()
  camera.addChild(chamberGfx)

  // Separate container for chamber text labels (PIXI.Text renders in world space)
  chamberLabels = new PIXI.Container()
  camera.addChild(chamberLabels)

  const antSprites = new AntSprites(app, camera)

  // HTML overlay for territory name labels
  labelContainer = document.createElement('div')
  labelContainer.id = 'territory-labels'
  labelContainer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:15;'
  document.body.appendChild(labelContainer)

  initInput(app, camera)

  useGameStore.subscribe(
    (s) => s.mapSeed,
    (seed) => { if (seed) mapLayer.generate(seed) }
  )

  // Center camera on MY queen when first full state arrives
  let centered = false
  useGameStore.subscribe(
    (s) => s.colonies,
    (colonies) => {
      const { myId } = useGameStore.getState()
      if (!myId || centered || !colonies[myId]) return
      const queen = Object.values(colonies[myId].ants || {}).find(a => a.caste === 'queen')
      if (!queen) return
      centered = true
      const zoom = 1.5
      camera.scale.set(zoom)
      camera.x = app.screen.width  / 2 - queen.position.x * zoom
      camera.y = app.screen.height / 2 - queen.position.y * zoom
    }
  )

  app.ticker.add((ticker) => {
    const { phase, colonies, myId, dayPhase } = useGameStore.getState()
    if (phase !== 'playing') return

    const targetAlpha = dayPhase === 'night' ? 0.45 : 1
    camera.alpha += (targetAlpha - camera.alpha) * 0.02

    pheromoneLayer.tick(ticker.deltaTime, colonies)
    antSprites.tick(colonies, myId)
    drawTerritories(colonies, myId)
    drawChambers(colonies, myId)
    updateTerritoryLabels(colonies, myId)
  })

  window.addEventListener('resize', () => app.resize())
  console.log('[renderer] Pixi.js v8 ready')
  return app
}

// ── Territory rings ────────────────────────────────────────────────────────────
function drawTerritories(colonies, myId) {
  if (!territoryGfx) return
  territoryGfx.clear()

  for (const [pid, colony] of Object.entries(colonies || {})) {
    if (!colony.territory) continue
    const { center, radius } = colony.territory
    const colorNum = parseInt((colony.color || '#888888').replace('#',''), 16)
    const isMe     = pid === myId

    // Faint filled zone
    territoryGfx
      .circle(center.x, center.y, radius)
      .fill({ color: colorNum, alpha: isMe ? 0.07 : 0.04 })

    // Solid border ring
    territoryGfx
      .circle(center.x, center.y, radius)
      .stroke({ color: colorNum, width: isMe ? 2.5 : 1.5, alpha: isMe ? 0.6 : 0.3 })

    // Dashed tick marks around border for own territory
    if (isMe) {
      for (let a = 0; a < Math.PI * 2; a += 0.22) {
        const r = radius
        territoryGfx
          .moveTo(center.x + Math.cos(a)*r,        center.y + Math.sin(a)*r)
          .lineTo(center.x + Math.cos(a+0.10)*r,   center.y + Math.sin(a+0.10)*r)
          .stroke({ color: colorNum, width: 1, alpha: 0.18 })
      }
    }
  }
}

// ── Chamber rendering with icons ───────────────────────────────────────────────
const CHAMBER_COLORS = {
  nursery:  0x86efac,   // green
  granary:  0xfde68a,   // yellow
  barracks: 0xfca5a5,   // red
  tunnel:   0x93c5fd    // blue
}

// Full word shown as floating label below icon
const CHAMBER_LABEL = {
  nursery:  'NURSERY',
  granary:  'GRANARY',
  barracks: 'BARRACKS',
  tunnel:   'TUNNEL'
}

// Single emoji shown inside the circle
const CHAMBER_EMOJI = {
  nursery:  '🥚',
  granary:  '🌾',
  barracks: '⚔',
  tunnel:   '🕳'
}

// Pool of PIXI.Text objects so we don't recreate every frame
const _textPool = {}  // chamberId → { icon: Text, label: Text }

function drawChambers(colonies, myId) {
  if (!chamberGfx || !chamberLabels) return
  chamberGfx.clear()

  const seenIds = new Set()

  for (const [pid, colony] of Object.entries(colonies || {})) {
    for (const ch of Object.values(colony.chambers || {})) {
      const color  = CHAMBER_COLORS[ch.type] || 0xffffff
      const isMe   = pid === myId
      const alpha  = ch.active ? 1 : 0.3
      const size   = 16
      const px     = ch.position.x
      const py     = ch.position.y

      seenIds.add(ch.id)

      // ── Graphics: circle body ──────────────────────────────────────────────
      chamberGfx
        .circle(px, py, size)
        .fill({ color, alpha: alpha * 0.2 })
      chamberGfx
        .circle(px, py, size)
        .stroke({ color, width: isMe ? 2.5 : 1.5, alpha: alpha * 0.85 })

      // ── HP bar above chamber (only when damaged) ───────────────────────────
      if (ch.active && ch.hp < ch.maxHp) {
        const pct  = ch.hp / ch.maxHp
        const bw   = 32
        chamberGfx
          .rect(px - bw/2, py - size - 10, bw, 5)
          .fill({ color: 0x111111 })
        chamberGfx
          .rect(px - bw/2, py - size - 10, bw * pct, 5)
          .fill({ color: pct > 0.5 ? 0x4ade80 : pct > 0.25 ? 0xf59e0b : 0xef4444 })
      }

      // ── Destroyed X ────────────────────────────────────────────────────────
      if (!ch.active) {
        const s = size * 0.65
        chamberGfx
          .moveTo(px-s, py-s).lineTo(px+s, py+s)
          .moveTo(px+s, py-s).lineTo(px-s, py+s)
          .stroke({ color: 0xef4444, width: 2.5, alpha: 0.7 })
      }

      // ── PIXI.Text: emoji icon inside circle ────────────────────────────────
      if (!_textPool[ch.id]) {
        const iconText = new PIXI.Text({
          text: CHAMBER_EMOJI[ch.type] || '?',
          style: {
            fontSize:    13,
            fontFamily:  'system-ui, sans-serif',
            fill:        '#ffffff',
            align:       'center'
          }
        })
        iconText.anchor.set(0.5, 0.5)

        const labelText = new PIXI.Text({
          text: CHAMBER_LABEL[ch.type] || ch.type.toUpperCase(),
          style: {
            fontSize:    7,
            fontFamily:  '"Cinzel", serif',
            fontWeight:  '600',
            fill:        '#' + color.toString(16).padStart(6,'0'),
            align:       'center',
            letterSpacing: 1
          }
        })
        labelText.anchor.set(0.5, 0)

        chamberLabels.addChild(iconText)
        chamberLabels.addChild(labelText)
        _textPool[ch.id] = { icon: iconText, label: labelText }
      }

      const pool = _textPool[ch.id]

      // Position icon centered in circle
      pool.icon.x = px
      pool.icon.y = py
      pool.icon.alpha = alpha

      // Position label just below circle
      pool.label.x = px
      pool.label.y = py + size + 3
      pool.label.alpha = alpha * (isMe ? 0.9 : 0.6)

      // Update label color to match colony color if not own
      const labelColor = '#' + color.toString(16).padStart(6,'0')
      if (pool.label.style.fill !== labelColor) {
        pool.label.style.fill = labelColor
      }
    }
  }

  // Hide text for chambers no longer in state
  for (const [id, pool] of Object.entries(_textPool)) {
    if (!seenIds.has(id)) {
      pool.icon.visible  = false
      pool.label.visible = false
    } else {
      pool.icon.visible  = true
      pool.label.visible = true
    }
  }
}

// ── Territory name labels (HTML, stays sharp at any zoom) ─────────────────────
function updateTerritoryLabels(colonies, myId) {
  if (!labelContainer || !camera || !app) return

  const zoom   = camera.scale.x
  const labels = []

  for (const [pid, colony] of Object.entries(colonies || {})) {
    if (!colony.territory?.center) continue
    const { x, y } = colony.territory.center
    const radius   = colony.territory.radius || 180

    // World → screen coords
    const sx = x      * zoom + camera.x
    const sy = (y - radius - 20) * zoom + camera.y

    // Skip if off-screen
    if (sx < -120 || sx > app.screen.width + 120) continue
    if (sy < -40  || sy > app.screen.height + 40) continue

    labels.push({
      sx, sy,
      name:  colony.name  || 'Colony',
      color: colony.color || '#888888',
      isMe:  pid === myId
    })
  }

  labelContainer.innerHTML = labels.map(l => `
    <div style="
      position:absolute;
      left:${l.sx}px;
      top:${l.sy}px;
      transform:translateX(-50%);
      font-family:'Cinzel',serif;
      font-size:${Math.max(9, Math.min(14, 11 * zoom))}px;
      font-weight:${l.isMe ? '700' : '400'};
      color:${l.color};
      text-shadow:0 0 10px ${l.color}55, 0 1px 4px #000000cc;
      letter-spacing:0.14em;
      white-space:nowrap;
      opacity:${l.isMe ? 1 : 0.6};
    ">${l.name.toUpperCase()}</div>
  `).join('')
}