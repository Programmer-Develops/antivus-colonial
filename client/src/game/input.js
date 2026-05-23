// ─── game/input.js — Click to move, drag to pan, scroll to zoom ──────────────
import { useGameStore } from '../store/gameStore.js'
import { emit }         from '../socket/client.js'

const TILE    = 32
const MAP_PX  = 64 * TILE   // 2048
const MIN_ZOOM = 0.35
const MAX_ZOOM = 2.5

let isDragging  = false
let dragStart   = { x: 0, y: 0 }
let camStart    = { x: 0, y: 0 }
let zoom        = 1

export function initInput(app, camera) {
  const canvas = app.canvas

  // ── Scroll to zoom ────────────────────────────────────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor))
    camera.scale.set(zoom)
    clampCamera(camera, app)
  }, { passive: false })

  // ── Right-click drag to pan ───────────────────────────────────────────────
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      isDragging = true
      dragStart  = { x: e.clientX, y: e.clientY }
      camStart   = { x: camera.x,  y: camera.y }
      canvas.style.cursor = 'grabbing'
    }
  })

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    camera.x = camStart.x + (e.clientX - dragStart.x)
    camera.y = camStart.y + (e.clientY - dragStart.y)
    clampCamera(camera, app)
  })

  window.addEventListener('mouseup', (e) => {
    if (e.button === 2) {
      isDragging = false
      canvas.style.cursor = 'default'
    }
  })

  // ── Left-click to move selected ants ─────────────────────────────────────
  canvas.addEventListener('click', (e) => {
    if (e.button !== 0) return
    const { phase, selectedAntIds } = useGameStore.getState()
    if (phase !== 'playing' || selectedAntIds.length === 0) return

    // Convert screen coords → world coords
    const rect = canvas.getBoundingClientRect()
    const wx = (e.clientX - rect.left  - camera.x) / zoom
    const wy = (e.clientY - rect.top   - camera.y) / zoom

    emit.moveAnts(selectedAntIds, { x: wx, y: wy })

    // Visual ripple at click point
    spawnClickRipple(e.clientX - rect.left, e.clientY - rect.top)
  })

  // Disable context menu on canvas
  canvas.addEventListener('contextmenu', (e) => e.preventDefault())
}

function clampCamera(camera, app) {
  const minX = app.screen.width  - MAP_PX * zoom
  const minY = app.screen.height - MAP_PX * zoom
  camera.x = Math.min(0, Math.max(minX, camera.x))
  camera.y = Math.min(0, Math.max(minY, camera.y))
}

function spawnClickRipple(x, y) {
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    width:20px; height:20px; margin:-10px;
    border:2px solid #4ade80; border-radius:50%;
    pointer-events:none; z-index:100;
    animation: ripple 0.5s ease-out forwards;
  `
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style')
    s.id = 'ripple-style'
    s.textContent = '@keyframes ripple { to { transform:scale(3); opacity:0; } }'
    document.head.appendChild(s)
  }
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 500)
}