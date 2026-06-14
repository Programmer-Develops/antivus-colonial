import * as PIXI from 'pixi.js'
import { useGameStore }   from '../store/gameStore.js'
import { PheromoneLayer } from './pheromoneLayer.js'
import { AntSprites }     from './antSprites.js'
import { MapLayer }       from './mapLayer.js'
import { initInput, setCameraOnPoint } from './input.js'

export let app    = null
export let camera = null

let territoryGfx  = null
let chamberGfx    = null
let chamberLabels = null
let htmlLabels    = null
let hoverLabel    = null
const _textPool   = {}

// Top-down shooter graphic layers
let projectileGfx = null
let foodGfx       = null
let cloudGfx      = null
let predatorGfx   = null

// Track readiness separately
let _mapReady    = false
let _playerPos   = null
let _centered    = false

export async function initRenderer(container) {
  app = new PIXI.Application()
  await app.init({
    resizeTo:        container,
    backgroundColor: 0x070708,
    antialias:       true,
    resolution:      Math.min(window.devicePixelRatio || 1, 2),
    autoDensity:     true
  })
  container.appendChild(app.canvas)

  camera = new PIXI.Container()
  camera.x = 0
  camera.y = 0
  app.stage.addChild(camera)

  const mapLayer       = new MapLayer(app, camera)
  const pheromoneLayer = new PheromoneLayer(app, camera)

  // Shooter graphic layers
  cloudGfx = new PIXI.Graphics()
  camera.addChild(cloudGfx)

  territoryGfx = new PIXI.Graphics()
  camera.addChild(territoryGfx)

  chamberGfx = new PIXI.Graphics()
  camera.addChild(chamberGfx)

  chamberLabels = new PIXI.Container()
  camera.addChild(chamberLabels)

  foodGfx = new PIXI.Graphics()
  camera.addChild(foodGfx)

  predatorGfx = new PIXI.Graphics()
  camera.addChild(predatorGfx)

  projectileGfx = new PIXI.Graphics()
  camera.addChild(projectileGfx)

  const antSprites = new AntSprites(app, camera)

  // HTML layers
  htmlLabels = document.createElement('div')
  htmlLabels.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:15;'
  document.body.appendChild(htmlLabels)

  hoverLabel = document.createElement('div')
  hoverLabel.style.cssText = `position:fixed;pointer-events:none;z-index:25;display:none;
    background:rgba(7,7,5,0.88);backdrop-filter:blur(6px);border-radius:6px;
    padding:5px 12px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;`
  document.body.appendChild(hoverLabel)

  // Hover over enemy territory
  app.canvas.addEventListener('mousemove', (e) => {
    if (useGameStore.getState().phase !== 'playing') return
    const rect = app.canvas.getBoundingClientRect()
    const z    = camera.scale.x
    const wx   = (e.clientX - rect.left - camera.x) / z
    const wy   = (e.clientY - rect.top  - camera.y) / z
    const { colonies, myId } = useGameStore.getState()
    let found = null
    for (const [pid, col] of Object.entries(colonies || {})) {
      if (pid === myId || !col.territory) continue
      if (Math.hypot(wx - col.territory.center.x, wy - col.territory.center.y) < col.territory.radius) {
        found = col; break
      }
    }
    if (found) {
      hoverLabel.style.display = 'block'
      hoverLabel.style.left    = (e.clientX + 14) + 'px'
      hoverLabel.style.top     = (e.clientY - 10) + 'px'
      hoverLabel.style.color   = found.color
      hoverLabel.textContent   = (found.name || 'Colony').toUpperCase()
    } else {
      hoverLabel.style.display = 'none'
    }
  })

  initInput(app, camera)

  // ── Correct Vanilla Zustand State Subscription Boot sequence ──────────────────────────
  useGameStore.subscribe((state) => {
    const seed = state.mapSeed
    if (seed && !_mapReady) {
      console.log('[renderer] generating map seed:', seed)
      mapLayer.generate(seed)
      _mapReady = true
      _tryCenterCamera()
    }

    const { colonies, myId } = state
    if (myId && colonies[myId]) {
      const playerAnt = colonies[myId].ants?.[myId]
      if (playerAnt && playerAnt.position) {
        _playerPos = { ...playerAnt.position }
        _tryCenterCamera()
      }
    }
  })

  // ── Main game render loop ──────────────────────────────────────────────────
  app.ticker.add((ticker) => {
    const { phase, colonies, myId, dayPhase, projectiles, foodShapes, clouds, predators } = useGameStore.getState()
    if (phase !== 'playing') return

    // Night time darkness dimming
    const targetAlpha = dayPhase === 'night' ? 0.42 : 1.0
    camera.alpha += (targetAlpha - camera.alpha) * 0.02

    // 1. Smooth Camera lock-on follow interpolation (Lerp)
    _updateCameraFollow(colonies, myId)

    // 2. Render tick sublayers
    pheromoneLayer.tick(ticker.deltaTime, colonies)
    antSprites.tick(colonies, myId)
    drawTerritories(colonies, myId)
    drawChambers(colonies, myId)
    updateHTMLLabels(colonies, myId)

    // 3. Top-down shooter visual ticks
    drawProjectiles(projectiles)
    drawFoodShapes(foodShapes)
    drawChemicalClouds(clouds)
    drawPredators(predators)
  })

  window.addEventListener('resize', () => app.resize())
  console.log('[renderer] ready')
  return app
}

function _tryCenterCamera() {
  if (_centered) return
  if (!_mapReady || !_playerPos) return
  if (!app || !camera) return
  _centered = true
  console.log('[renderer] centering camera on player ant at', _playerPos)
  setCameraOnPoint(_playerPos.x, _playerPos.y, 1.4)
}

// ── Smooth Camera Follow (Lerp) ──────────────────────────────────────────────
function _updateCameraFollow(colonies, myId) {
  if (!myId || !colonies[myId]) return
  const playerAnt = colonies[myId].ants?.[myId]
  if (!playerAnt || !playerAnt.position) return

  const z = camera.scale.x
  const targetX = app.screen.width / 2 - playerAnt.position.x * z
  const targetY = app.screen.height / 2 - playerAnt.position.y * z

  camera.x += (targetX - camera.x) * 0.1
  camera.y += (targetY - camera.y) * 0.1

  const mapSizePx = 2048
  const minCX = app.screen.width - mapSizePx * z
  const minCY = app.screen.height - mapSizePx * z

  if (app.screen.width > mapSizePx * z) {
    camera.x = (app.screen.width - mapSizePx * z) / 2
  } else {
    camera.x = Math.min(0, Math.max(minCX, camera.x))
  }

  if (app.screen.height > mapSizePx * z) {
    camera.y = (app.screen.height - mapSizePx * z) / 2
  } else {
    camera.y = Math.min(0, Math.max(minCY, camera.y))
  }
}

// ── Render Chemical Projectiles ──────────────────────────────────────────────
function drawProjectiles(projectiles) {
  projectileGfx.clear()
  for (const p of projectiles || []) {
    const col = parseInt(p.color.replace('#', ''), 16)
    let r = 4.5
    if (p.type === 'explosive') r = 7.5
    if (p.type === 'needle') r = 3.0
    if (p.type === 'stinger') r = 4.0

    projectileGfx.circle(p.x, p.y, r).fill({ color: col })

    const angle = Math.atan2(p.vy, p.vx)
    projectileGfx.moveTo(p.x, p.y)
      .lineTo(p.x - Math.cos(angle) * 14, p.y - Math.sin(angle) * 14)
      .stroke({ color: col, width: r * 0.8, alpha: 0.35 })
  }
}

// ── Render Multi-tiered Food Shapes ──────────────────────────────────────────
function drawFoodShapes(shapes) {
  foodGfx.clear()
  for (const sh of shapes || []) {
    const col = parseInt(sh.color.replace('#', ''), 16)
    const x = sh.x, y = sh.y, size = sh.size
    sh.rotation = (sh.rotation || 0) + (sh.rotSpeed || 0.01)

    if (sh.type === 'glow-orb') {
      const pulse = Math.sin(Date.now() * 0.008 + sh.x * 0.05) * 2.2
      foodGfx.circle(x, y, size + 4.5 + pulse).stroke({ color: col, width: 1.5, alpha: 0.65 })
      foodGfx.circle(x, y, size + pulse).fill({ color: col, alpha: 0.9 })
    } else if (sh.type === 'leaf') {
      foodGfx.poly([
        x + Math.cos(sh.rotation) * size, y + Math.sin(sh.rotation) * size,
        x + Math.cos(sh.rotation + Math.PI * 2 / 3) * size, y + Math.sin(sh.rotation + Math.PI * 2 / 3) * size,
        x + Math.cos(sh.rotation + Math.PI * 4 / 3) * size, y + Math.sin(sh.rotation + Math.PI * 4 / 3) * size
      ]).fill({ color: col }).stroke({ color: 0xffffff, width: 0.8, alpha: 0.3 })
    } else if (sh.type === 'sugar') {
      foodGfx.poly([
        x + Math.cos(sh.rotation) * size, y + Math.sin(sh.rotation) * size,
        x + Math.cos(sh.rotation + Math.PI / 2) * size, y + Math.sin(sh.rotation + Math.PI / 2) * size,
        x + Math.cos(sh.rotation + Math.PI) * size, y + Math.sin(sh.rotation + Math.PI) * size,
        x + Math.cos(sh.rotation + Math.PI * 3 / 2) * size, y + Math.sin(sh.rotation + Math.PI * 3 / 2) * size
      ]).fill({ color: col }).stroke({ color: 0xffffff, width: 0.8, alpha: 0.3 })
    } else {
      const points = []
      for (let i = 0; i < 6; i++) {
        points.push(x + Math.cos(sh.rotation + i * Math.PI / 3) * size)
        points.push(y + Math.sin(sh.rotation + i * Math.PI / 3) * size)
      }
      foodGfx.poly(points).fill({ color: col }).stroke({ color: 0xffffff, width: 1.2, alpha: 0.4 })
    }

    if (sh.hp < sh.maxHp) {
      const pct = sh.hp / sh.maxHp, bw = size * 2.2
      foodGfx.rect(x - bw/2, y - size - 8, bw, 3).fill({ color: 0x111111 })
      foodGfx.rect(x - bw/2, y - size - 8, bw * pct, 3).fill({ color: 0x4ade80 })
    }
  }
}

// ── Render Reaction Chemical Clouds ──────────────────────────────────────────
function drawChemicalClouds(clouds) {
  cloudGfx.clear()
  for (const c of clouds || []) {
    let col = 0x4ade80
    let alpha = 0.16
    if (c.type === 'poison') { col = 0xa78bfa; alpha = 0.18 }
    if (c.type === 'silk') { col = 0xe8e6d9; alpha = 0.22 }
    if (c.type === 'silk-acid') { col = 0xfacc15; alpha = 0.20 }

    cloudGfx.circle(c.x, c.y, c.radius).fill({ color: col, alpha })
    cloudGfx.circle(c.x, c.y, c.radius * 0.65).fill({ color: col, alpha: alpha * 0.6 })
    cloudGfx.circle(c.x, c.y, c.radius).stroke({ color: col, width: 1.5, alpha: alpha * 2.2 })
  }
}

// ── Render Boss Spiders and Hunter Beetles ───────────────────────────────────
function drawPredators(predators) {
  predatorGfx.clear()
  for (const p of predators || []) {
    const x = p.x, y = p.y, size = p.size
    const isBoss = p.name.includes('APEX')
    const col = isBoss ? 0xef4444 : 0xf97316

    predatorGfx.circle(x, y, size).fill({ color: col, alpha: 0.88 })
    predatorGfx.circle(x, y, size + 5).stroke({ color: col, width: 2.5, alpha: 0.5 })

    const legLen = size * 1.65
    const time = Date.now() * 0.016
    for (let i = 0; i < 8; i++) {
      const baseAng = i * Math.PI / 4 + Math.sin(time + i * 1.5) * 0.25
      predatorGfx.moveTo(x, y)
        .lineTo(x + Math.cos(baseAng) * legLen, y + Math.sin(baseAng) * legLen)
        .stroke({ color: col, width: isBoss ? 3.5 : 2.0, alpha: 0.45 })
    }

    if (isBoss) {
      predatorGfx.circle(x - 5, y - 6, 3).fill({ color: 0xffffff })
      predatorGfx.circle(x + 5, y - 6, 3).fill({ color: 0xffffff })
    }

    if (p.chasing) {
      // Exclamation alert warning drawn above head
      const warnY = y - size - 20
      predatorGfx.rect(x - 1.8, warnY - 11, 3.6, 7.5).fill({ color: 0xef4444 })
      predatorGfx.circle(x, warnY - 1.5, 1.8).fill({ color: 0xef4444 })

      // Pulsing red danger indicator ring
      const pulseRing = size + 7 + Math.sin(Date.now() * 0.018) * 3.5
      predatorGfx.circle(x, y, pulseRing).stroke({ color: 0xef4444, width: 1.8, alpha: 0.85 })
    }

    const pct = p.hp / p.maxHp, bw = size * 2.6
    predatorGfx.rect(x - bw/2, y - size - 14, bw, 4).fill({ color: 0x111111 })
    predatorGfx.rect(x - bw/2, y - size - 14, bw * pct, 4).fill({ color: 0xef4444 })
  }
}

// ── Territory ──────────────────────────────────────────────────────────────────
function drawTerritories(colonies, myId) {
  territoryGfx.clear()
  for (const [pid, colony] of Object.entries(colonies || {})) {
    if (!colony.territory) continue
    const { center, radius } = colony.territory
    const col  = parseInt((colony.color || '#888').replace('#',''), 16)
    const isMe = pid === myId
    territoryGfx.circle(center.x, center.y, radius)
      .fill({ color: col, alpha: isMe ? 0.06 : 0.02 })
    territoryGfx.circle(center.x, center.y, radius)
      .stroke({ color: col, width: isMe ? 2.5 : 1.5, alpha: isMe ? 0.65 : 0.25 })
  }
}

// ── Chambers ───────────────────────────────────────────────────────────────────
const CH_COL   = { granary:0xfde68a, barracks:0xfca5a5, tunnel:0x93c5fd, nursery:0x86efac }
const CH_EMOJI = { granary:'🌾', barracks:'⚔', tunnel:'🕳', nursery:'🥚' }
const CH_WORD  = { granary:'GRANARY', barracks:'BARRACKS', tunnel:'TUNNEL', nursery:'NURSERY' }

function drawChambers(colonies, myId) {
  chamberGfx.clear()
  const seen = new Set()
  for (const [pid, colony] of Object.entries(colonies || {})) {
    for (const ch of Object.values(colony.chambers || {})) {
      seen.add(ch.id)
      const col   = CH_COL[ch.type] || 0xffffff
      const isMe  = pid === myId
      const alpha = ch.active ? 1 : 0.3
      const R = 16, px = ch.position.x, py = ch.position.y

      chamberGfx.circle(px, py, R).fill({ color: col, alpha: alpha * 0.18 })
      chamberGfx.circle(px, py, R).stroke({ color: col, width: isMe ? 2.5 : 1.5, alpha: alpha * 0.9 })

      if (ch.active && ch.hp < ch.maxHp) {
        const pct = ch.hp / ch.maxHp, bw = 34
        chamberGfx.rect(px-bw/2, py-R-11, bw, 5).fill({ color: 0x111111 })
        chamberGfx.rect(px-bw/2, py-R-11, bw*pct, 5)
          .fill({ color: pct>0.5?0x4ade80:pct>0.25?0xf59e0b:0xef4444 })
      }
      if (!ch.active) {
        const s = R*0.6
        chamberGfx.moveTo(px-s,py-s).lineTo(px+s,py+s).stroke({color:0xef4444,width:2.5,alpha:0.7})
        chamberGfx.moveTo(px+s,py-s).lineTo(px-s,py+s).stroke({color:0xef4444,width:2.5,alpha:0.7})
      }

      if (!_textPool[ch.id]) {
        const hexStr = '#' + col.toString(16).padStart(6,'0')
        const icon = new PIXI.Text({ text: CH_EMOJI[ch.type]||'?',
          style:{ fontSize:13, fontFamily:'system-ui', fill:'#ffffff', align:'center' }})
        icon.anchor.set(0.5, 0.5)
        const lbl = new PIXI.Text({ text: CH_WORD[ch.type]||ch.type.toUpperCase(),
          style:{ fontSize:7, fontFamily:'"Cinzel",serif', fontWeight:'600', fill:hexStr, align:'center', letterSpacing:1 }})
        lbl.anchor.set(0.5, 0)
        chamberLabels.addChild(icon)
        chamberLabels.addChild(lbl)
        _textPool[ch.id] = { icon, lbl }
      }
      const p = _textPool[ch.id]
      p.icon.x=px; p.icon.y=py; p.icon.alpha=alpha; p.icon.visible=true
      p.lbl.x=px;  p.lbl.y=py+R+3; p.lbl.alpha=alpha*(isMe?0.95:0.6); p.lbl.visible=true
    }
  }
  for (const [id, p] of Object.entries(_textPool)) {
    if (!seen.has(id)) { p.icon.visible=false; p.lbl.visible=false }
  }
}

// ── Territory labels ────────────────────────────────────────────────────────────
function updateHTMLLabels(colonies, myId) {
  if (!htmlLabels || !camera || !app) return
  const z = camera.scale.x
  const out = []
  for (const [pid, colony] of Object.entries(colonies || {})) {
    if (!colony.territory?.center) continue
    const { x, y } = colony.territory.center
    const r  = colony.territory.radius || 160
    const sx = x * z + camera.x
    const sy = (y - r - 22) * z + camera.y
    if (sx < -150 || sx > app.screen.width+150) continue
    if (sy < -50  || sy > app.screen.height+50) continue
    out.push({ sx, sy, name:colony.name||'Colony', color:colony.color||'#888', isMe:pid===myId })
  }
  htmlLabels.innerHTML = out.map(l => `
    <div style="position:absolute;left:${l.sx}px;top:${l.sy}px;transform:translateX(-50%);
      font-family:'Cinzel',serif;font-size:${Math.max(9,Math.min(14,11*z))}px;
      font-weight:${l.isMe?'700':'400'};color:${l.color};
      text-shadow:0 0 10px ${l.color}55,0 1px 4px #000c;
      letter-spacing:0.14em;white-space:nowrap;
      opacity:${l.isMe?1:0.55};">${l.name.toUpperCase()}</div>
  `).join('')
}