// ─── game/input.js — Selection, movement, pan, zoom ──────────────────────────
import { useGameStore } from '../store/gameStore.js'
import { emit }         from '../socket/client.js'

const TILE     = 32
const MAP_PX   = 64 * TILE   // 2048
const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.5

let isDragging = false
let dragStart  = { x: 0, y: 0 }
let camStart   = { x: 0, y: 0 }
let zoom       = 1
let hasDragged = false  // distinguish drag from click

export function initInput(app, camera) {
  const canvas = app.canvas

  // ── Scroll to zoom ─────────────────────────────────────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor))
    camera.scale.set(zoom)
    clampCamera(camera, app)
  }, { passive: false })

  // ── Right-click OR middle-click drag to pan ────────────────────────────────
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
      isDragging = true
      hasDragged = false
      dragStart  = { x: e.clientX, y: e.clientY }
      camStart   = { x: camera.x,  y: camera.y }
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
    clampCamera(camera, app)
  })

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1 || e.button === 2) {
      isDragging = false
      canvas.style.cursor = 'default'
    }
  })

  canvas.addEventListener('contextmenu', (e) => e.preventDefault())

  // ── Left-click: select ant OR move selected ants ───────────────────────────
  canvas.addEventListener('click', (e) => {
    if (e.button !== 0 || hasDragged) return
    if (useGameStore.getState().phase !== 'playing') return

    const rect = canvas.getBoundingClientRect()
    // Convert screen → world coordinates
    const wx = (e.clientX - rect.left  - camera.x) / zoom
    const wy = (e.clientY - rect.top   - camera.y) / zoom

    const { colonies, myId, selectedAntIds } = useGameStore.getState()
    const myColony = colonies[myId]
    if (!myColony) return

    // Check if clicked near any of MY ants
    const clickedAntId = findAntAt(wx, wy, myColony)

    if (clickedAntId) {
      // Select the clicked ant (or deselect if already selected)
      const isSelected = selectedAntIds.includes(clickedAntId)
      if (isSelected) {
        useGameStore.getState().setSelection([])
        updateSelectionIndicator(0)
      } else {
        useGameStore.getState().setSelection([clickedAntId])
        updateSelectionIndicator(1)
        spawnSelectPulse(e.clientX - rect.left, e.clientY - rect.top, '#4ade80')
      }
    } else {
      // No ant clicked — if ants are selected, move them here
      if (selectedAntIds.length > 0) {
        emit.moveAnts(selectedAntIds, { x: wx, y: wy })
        spawnClickRipple(e.clientX - rect.left, e.clientY - rect.top)
      } else {
        // Nothing selected and clicked empty space — deselect
        useGameStore.getState().setSelection([])
        updateSelectionIndicator(0)
      }
    }
  })

  // ── Select ALL own ants with 'A' key ───────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    const { phase, colonies, myId } = useGameStore.getState()
    if (phase !== 'playing') return

    if (e.key === 'a' || e.key === 'A') {
      const myColony = colonies[myId]
      if (!myColony) return
      const allIds = Object.keys(myColony.ants)
      useGameStore.getState().setSelection(allIds)
      updateSelectionIndicator(allIds.length)
      showHint(`All ${allIds.length} ants selected`)
    }

    if (e.key === 'Escape') {
      useGameStore.getState().setSelection([])
      updateSelectionIndicator(0)
    }
  })
}

// ── Find the closest ant within click radius ──────────────────────────────────
function findAntAt(wx, wy, colony) {
  const CLICK_RADIUS = 18  // world pixels — generous for small ants
  let closest = null
  let closestDist = CLICK_RADIUS

  for (const [antId, ant] of Object.entries(colony.ants || {})) {
    if (!ant.position) continue
    const dx   = ant.position.x - wx
    const dy   = ant.position.y - wy
    const dist = Math.sqrt(dx*dx + dy*dy)
    if (dist < closestDist) {
      closestDist = dist
      closest     = antId
    }
  }
  return closest
}

function clampCamera(camera, app) {
  const minX = app.screen.width  - MAP_PX * zoom
  const minY = app.screen.height - MAP_PX * zoom
  camera.x = Math.min(0, Math.max(minX, camera.x))
  camera.y = Math.min(0, Math.max(minY, camera.y))
}

function updateSelectionIndicator(count) {
  const el = document.getElementById('selection-count')
  if (!el) return
  el.textContent = count > 0 ? `${count} ant${count > 1 ? 's' : ''} selected` : ''
  el.style.opacity = count > 0 ? '1' : '0'
}

function showHint(msg) {
  const el = document.getElementById('hint-text')
  if (!el) return
  el.textContent = msg
  el.style.opacity = '1'
  clearTimeout(el._t)
  el._t = setTimeout(() => { el.style.opacity = '0' }, 2000)
}

function spawnClickRipple(x, y) {
  spawnRing(x, y, '#4ade80', 'scale(4)')
}

function spawnSelectPulse(x, y, color) {
  spawnRing(x, y, color, 'scale(2.5)')
}

function spawnRing(x, y, color, toScale) {
  injectRippleStyle()
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:16px; height:16px; margin:-8px;
    border:2px solid ${color}; border-radius:50%;
    pointer-events:none; z-index:200;
    animation: rippleAnim 0.45s ease-out forwards;
    --to-scale: ${toScale};
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 450)
}

function injectRippleStyle() {
  if (document.getElementById('ripple-style')) return
  const s = document.createElement('style')
  s.id = 'ripple-style'
  s.textContent = `
    @keyframes rippleAnim {
      to { transform: var(--to-scale, scale(3)); opacity: 0; }
    }
  `
  document.head.appendChild(s)
}