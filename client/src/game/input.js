import { useGameStore } from '../store/gameStore.js'
import { emit }         from '../socket/client.js'

const TILE     = 32
const MAP_PX   = 64 * TILE
const MIN_ZOOM = 0.25
const MAX_ZOOM = 3.0

let isDragging = false
let dragStart  = { x:0, y:0 }
let camStart   = { x:0, y:0 }
let hasDragged = false
let _app       = null
let _camera    = null

// Track current zoom separately so we can zoom toward mouse
let currentZoom = 1.5

export function initInput(app, camera) {
  _app    = app
  _camera = camera
  const canvas = app.canvas

  // ── Zoom toward mouse position ─────────────────────────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const rect   = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // World position under mouse BEFORE zoom
    const worldX = (mouseX - camera.x) / currentZoom
    const worldY = (mouseY - camera.y) / currentZoom

    const factor  = e.deltaY > 0 ? 0.88 : 1.14
    currentZoom   = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom * factor))
    camera.scale.set(currentZoom)

    // Reposition camera so world point stays under mouse
    camera.x = mouseX - worldX * currentZoom
    camera.y = mouseY - worldY * currentZoom

    clampCamera()
  }, { passive: false })

  // ── Right-click / middle-click drag to pan ─────────────────────────────────
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
      isDragging = true
      hasDragged = false
      dragStart  = { x:e.clientX, y:e.clientY }
      camStart   = { x:camera.x,  y:camera.y }
      canvas.style.cursor = 'grabbing'
    }
  })

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true
    camera.x = camStart.x + dx
    camera.y = camStart.y + dy
    clampCamera()
  })

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1 || e.button === 2) {
      isDragging = false
      canvas.style.cursor = 'default'
    }
  })

  canvas.addEventListener('contextmenu', e => e.preventDefault())

  // ── Left-click: select ant OR move selected ants OR place chamber ──────────
  canvas.addEventListener('click', (e) => {
    if (e.button !== 0 || hasDragged) return
    const { phase, selectedAntIds, placingChamber } = useGameStore.getState()
    if (phase !== 'playing') return

    const rect = canvas.getBoundingClientRect()
    const wx   = (e.clientX - rect.left  - camera.x) / currentZoom
    const wy   = (e.clientY - rect.top   - camera.y) / currentZoom

    // Chamber placement mode
    if (placingChamber) {
      emit.buildChamber(placingChamber, { x:wx, y:wy })
      useGameStore.getState().setPlacingChamber(null)
      clearPlacementCursor()
      spawnClickRipple(e.clientX - rect.left, e.clientY - rect.top, '#fbbf24')
      return
    }

    const { colonies, myId } = useGameStore.getState()
    const myColony = colonies[myId]
    if (!myColony) return

    const clickedAntId = findAntAt(wx, wy, myColony)

    if (clickedAntId) {
      const isSelected = selectedAntIds.includes(clickedAntId)
      useGameStore.getState().setSelection(isSelected ? [] : [clickedAntId])
      updateSelectionUI(isSelected ? 0 : 1)
      if (!isSelected) spawnClickRipple(e.clientX - rect.left, e.clientY - rect.top, '#4ade80')
    } else if (selectedAntIds.length > 0) {
      emit.moveAnts(selectedAntIds, { x:wx, y:wy })
      spawnClickRipple(e.clientX - rect.left, e.clientY - rect.top, '#4ade80')
    } else {
      useGameStore.getState().setSelection([])
      updateSelectionUI(0)
    }
  })

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    const { phase, colonies, myId } = useGameStore.getState()
    if (phase !== 'playing') return

    if (e.key === 'a' || e.key === 'A') {
      const myColony = colonies[myId]
      if (!myColony) return
      const allIds = Object.keys(myColony.ants)
      useGameStore.getState().setSelection(allIds)
      updateSelectionUI(allIds.length)
      showHint(`All ${allIds.length} ants selected`)
    }

    if (e.key === 'Escape') {
      useGameStore.getState().setSelection([])
      useGameStore.getState().setPlacingChamber(null)
      updateSelectionUI(0)
      clearPlacementCursor()
    }

    if (e.key === 'r' || e.key === 'R') togglePanel('hud-recruit')
    if (e.key === 'b' || e.key === 'B') togglePanel('hud-build')
  })
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function findAntAt(wx, wy, colony) {
  let best = null, bestDist = 20
  for (const [antId, ant] of Object.entries(colony.ants || {})) {
    if (!ant.position) continue
    const dx = ant.position.x - wx
    const dy = ant.position.y - wy
    const d  = Math.sqrt(dx*dx+dy*dy)
    if (d < bestDist) { bestDist = d; best = antId }
  }
  return best
}

function clampCamera() {
  if (!_app || !_camera) return
  const minX = _app.screen.width  - MAP_PX * currentZoom
  const minY = _app.screen.height - MAP_PX * currentZoom
  _camera.x = Math.min(0, Math.max(minX, _camera.x))
  _camera.y = Math.min(0, Math.max(minY, _camera.y))
}

function updateSelectionUI(count) {
  const el = document.getElementById('selection-count')
  if (!el) return
  el.textContent = count > 0 ? `${count} ant${count>1?'s':''} selected` : ''
  el.style.opacity = count > 0 ? '1' : '0'
}

function showHint(msg) {
  const el = document.getElementById('hint-text')
  if (!el) return
  el.textContent = msg; el.style.opacity = '1'
  clearTimeout(el._t)
  el._t = setTimeout(() => { el.style.opacity = '0' }, 2000)
}

function togglePanel(id) {
  const el = document.getElementById(id)
  if (!el) return
  el.style.display = el.style.display === 'none' ? 'flex' : 'none'
}

function clearPlacementCursor() {
  document.body.style.cursor = 'default'
  const el = document.getElementById('placement-hint')
  if (el) el.remove()
}

export function startPlacingChamber(type) {
  useGameStore.getState().setPlacingChamber(type)
  document.body.style.cursor = 'crosshair'
  // Show floating hint
  let el = document.getElementById('placement-hint')
  if (!el) {
    el = document.createElement('div')
    el.id = 'placement-hint'
    el.style.cssText = `
      position:fixed; bottom:120px; left:50%; transform:translateX(-50%);
      background:rgba(251,191,36,0.15); border:0.5px solid rgba(251,191,36,0.5);
      border-radius:99px; padding:6px 20px;
      font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.1em;
      color:#fbbf24; pointer-events:none; z-index:50;
    `
    document.body.appendChild(el)
  }
  el.textContent = `Click inside your territory to place ${type.toUpperCase()} · Esc to cancel`
}

function spawnClickRipple(x, y, color) {
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style')
    s.id = 'ripple-style'
    s.textContent = '@keyframes rippleAnim { to { transform:scale(4); opacity:0; } }'
    document.head.appendChild(s)
  }
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:14px; height:14px; margin:-7px;
    border:2px solid ${color}; border-radius:50%;
    pointer-events:none; z-index:200;
    animation: rippleAnim 0.4s ease-out forwards;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 400)
}