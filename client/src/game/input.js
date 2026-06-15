// ─── input.js ─────────────────────────────────────────────────────────────────
import { useGameStore }     from '../store/gameStore.js'
import { emit }             from '../socket/client.js'

const MAP_SIZE = 64 * 32   // 2048px world

let _app  = null
let _cam  = null
let _z    = 1.5   // current zoom

// Keyboard and mouse states
const _keys = { w: false, a: false, s: false, d: false, shift: false }
let _lastMX = 0, _lastMY = 0
let _mouseX = 0, _mouseY = 0
let _mouseFiring = false
let _autoFire = false

export function initInput(app, cam) {
  _app = app
  _cam = cam
  const cv = app.canvas

  // ── ZOOM ──────────────────────────────────────────────────────────────────
  cv.addEventListener('wheel', (e) => {
    e.preventDefault()
    const rect  = cv.getBoundingClientRect()
    const sx    = e.clientX - rect.left
    const sy    = e.clientY - rect.top

    // world coords under mouse BEFORE zoom
    const wx = (sx - _cam.x) / _z
    const wy = (sy - _cam.y) / _z

    const minZ = Math.max(_app.screen.width / MAP_SIZE, _app.screen.height / MAP_SIZE)
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    _z = Math.max(minZ, Math.min(3, _z * factor))

    _cam.scale.x = _z
    _cam.scale.y = _z

    _cam.x = sx - wx * _z
    _cam.y = sy - wy * _z
    _clamp()
  }, { passive: false })

  // ── Mouse movement tracking ──────────────────────────────────────────────
  window.addEventListener('mousemove', (e) => {
    _lastMX = e.clientX
    _lastMY = e.clientY
  })

  // ── Left click shooting & Chamber placing ────────────────────────────────
  cv.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      const { placingChamber } = useGameStore.getState()
      if (placingChamber) {
        // Place chamber
        const rect = cv.getBoundingClientRect()
        const wx   = (e.clientX - rect.left - _cam.x) / _z
        const wy   = (e.clientY - rect.top  - _cam.y) / _z
        emit.buildChamber(placingChamber, { x: wx, y: wy })
        useGameStore.getState().setPlacingChamber(null)
        _clearPlacement()
        _ripple(e.clientX - rect.left, e.clientY - rect.top, '#fbbf24')
      } else {
        _mouseFiring = true
      }
    }
  })

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      _mouseFiring = false
    }
  })

  cv.addEventListener('contextmenu', e => e.preventDefault())

  // ── Keyboard listeners (WASD, Auto-fire, Skills) ────────────────────────
  window.addEventListener('keydown', (e) => {
    const { phase } = useGameStore.getState()
    if (phase !== 'playing') return

    const key = (e.key || '').toLowerCase()
    if (key === 'w' || e.key === 'ArrowUp')    _keys.w = true
    if (key === 's' || e.key === 'ArrowDown')  _keys.s = true
    if (key === 'a' || e.key === 'ArrowLeft')  _keys.a = true
    if (key === 'd' || e.key === 'ArrowRight') _keys.d = true
    if (e.key === 'Shift')                     _keys.shift = true

    // Toggle Auto-Fire
    if (key === 'e') {
      _autoFire = !_autoFire
      showToast(_autoFire ? '⚙️ Auto-fire ENABLED' : '⚙️ Auto-fire DISABLED', 'info')
    }

    if (e.key === 'Escape') {
      useGameStore.getState().setPlacingChamber(null)
      _clearPlacement()
    }
    if (key === 'b') _toggleEl('hud-build')
  })

  window.addEventListener('keyup', (e) => {
    const key = (e.key || '').toLowerCase()
    if (key === 'w' || e.key === 'ArrowUp')    _keys.w = false
    if (key === 's' || e.key === 'ArrowDown')  _keys.s = false
    if (key === 'a' || e.key === 'ArrowLeft')  _keys.a = false
    if (key === 'd' || e.key === 'ArrowRight') _keys.d = false
    if (e.key === 'Shift')                     _keys.shift = false
  })

  // ── Continuous Aim & Input emitter loop in Pixi's ticker ──────────────────
  app.ticker.add(() => {
    const { phase } = useGameStore.getState()
    if (phase !== 'playing') return

    // Calculate current mouse world coords relative to panning camera
    const rect = cv.getBoundingClientRect()
    const sx = _lastMX - rect.left
    const sy = _lastMY - rect.top
    _mouseX = (sx - _cam.x) / _z
    _mouseY = (sy - _cam.y) / _z

    // Emit packed input command packet to server
    emit.sendPlayerInput({
      keys: _keys,
      mx: _mouseX,
      my: _mouseY,
      firing: (_mouseFiring || _autoFire),
      activeSkill: _keys.shift
    })
  })
}

// ── Camera locking utility ───────────────────────────────────────────────────
export function setCameraOnPoint(wx, wy, zoom) {
  if (!_app || !_cam) return
  _z = zoom ?? 1.5
  _cam.scale.x = _z
  _cam.scale.y = _z
  _cam.x = _app.screen.width  / 2 - wx * _z
  _cam.y = _app.screen.height / 2 - wy * _z
  _clamp()
}

export function startPlacingChamber(type) {
  useGameStore.getState().setPlacingChamber(type)
  document.body.style.cursor = 'crosshair'
  let el = document.getElementById('placement-hint')
  if (!el) {
    el = document.createElement('div')
    el.id = 'placement-hint'
    document.body.appendChild(el)
  }
  el.style.cssText = `
    position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
    background:rgba(251,191,36,0.12);border:0.5px solid rgba(251,191,36,0.5);
    border-radius:99px;padding:6px 20px;font-family:'Cinzel',serif;
    font-size:11px;letter-spacing:0.1em;color:#fbbf24;pointer-events:none;z-index:50;
  `
  el.textContent = `Click inside your territory to deploy ${type.toUpperCase()} · Esc to cancel`
}

function _clamp() {
  if (!_app || !_cam) return
  const minX = _app.screen.width  - MAP_SIZE * _z
  const minY = _app.screen.height - MAP_SIZE * _z

  if (_app.screen.width > MAP_SIZE * _z) {
    _cam.x = (_app.screen.width - MAP_SIZE * _z) / 2
  } else {
    _cam.x = Math.min(0, Math.max(minX, _cam.x))
  }

  if (_app.screen.height > MAP_SIZE * _z) {
    _cam.y = (_app.screen.height - MAP_SIZE * _z) / 2
  } else {
    _cam.y = Math.min(0, Math.max(minY, _cam.y))
  }
}

function _clearPlacement() {
  document.body.style.cursor = 'default'
  document.getElementById('placement-hint')?.remove()
}

function _toggleEl(id) {
  const el = document.getElementById(id)
  if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none'
}

function _ripple(x, y, color) {
  if (!document.getElementById('_rpl')) {
    const s = document.createElement('style')
    s.id = '_rpl'
    s.textContent = '@keyframes _rpl{to{transform:scale(4);opacity:0}}'
    document.head.appendChild(s)
  }
  const el = document.createElement('div')
  el.style.cssText = `
    position:fixed;left:${x}px;top:${y}px;
    width:14px;height:14px;margin:-7px;
    border:2px solid ${color};border-radius:50%;
    pointer-events:none;z-index:200;
    animation:_rpl 0.4s ease-out forwards;
  `
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 420)
}

function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container')
  if (!c) return
  const t = document.createElement('div')
  t.className = `toast toast-${type}`
  t.textContent = msg
  c.appendChild(t)
  setTimeout(() => t.classList.add('toast-show'), 10)
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 400) }, 2000)
}