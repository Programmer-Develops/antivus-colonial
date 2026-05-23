// ─── ui/hud.js — In-game HUD: resources, morale, day/night, kill feed ─────────
import { useGameStore } from '../store/gameStore.js'
import { emit }         from '../socket/client.js'

export function initUI(overlay) {
  // Inject all HUD HTML
  overlay.insertAdjacentHTML('beforeend', `

    <!-- Resources top-left -->
    <div id="hud-resources" style="
      position:absolute; top:16px; left:16px;
      background:rgba(7,7,5,0.85); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:10px;
      padding:10px 16px; display:none; flex-direction:column; gap:6px;
      font-family:'Crimson Pro',serif; font-size:14px;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:2px">COLONY RESOURCES</div>
      <div class="res-row"><span class="res-icon">🍃</span><span id="res-leaf">0</span><span class="res-label">Leaf</span></div>
      <div class="res-row"><span class="res-icon">🍄</span><span id="res-fungus">0</span><span class="res-label">Fungus</span></div>
      <div class="res-row"><span class="res-icon">💧</span><span id="res-honeydew">0</span><span class="res-label">Honeydew</span></div>
      <div class="res-row"><span class="res-icon">🪲</span><span id="res-carapace">0</span><span class="res-label">Carapace</span></div>
    </div>

    <!-- Day/night top-center -->
    <div id="hud-daycycle" style="
      position:absolute; top:16px; left:50%; transform:translateX(-50%);
      background:rgba(7,7,5,0.85); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:99px;
      padding:7px 20px; display:none; align-items:center; gap:10px;
      font-family:'Cinzel',serif; font-size:11px; letter-spacing:0.1em;
    ">
      <span id="day-icon">☀</span>
      <span id="day-label" style="color:#fbbf24">DAY</span>
      <div style="width:80px;height:4px;background:#1a1a14;border-radius:2px;overflow:hidden">
        <div id="day-bar" style="height:100%;background:#fbbf24;width:100%;transition:width 1s linear;border-radius:2px"></div>
      </div>
    </div>

    <!-- Ant count + morale bottom-left -->
    <div id="hud-colony" style="
      position:absolute; bottom:80px; left:16px;
      background:rgba(7,7,5,0.85); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:10px;
      padding:10px 16px; display:none; flex-direction:column; gap:8px;
      font-family:'Crimson Pro',serif; min-width:160px;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80">COLONY STATUS</div>
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#e8e6d9">
        <span>🐜 Ants</span><span id="ant-count">0</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b6b5a;margin-bottom:4px">
          <span>Morale</span><span id="morale-val">100</span>
        </div>
        <div style="height:5px;background:#1a1a14;border-radius:3px;overflow:hidden">
          <div id="morale-bar" style="height:100%;background:#4ade80;width:100%;transition:width 0.5s ease;border-radius:3px"></div>
        </div>
      </div>
    </div>

    <!-- Build panel bottom-center -->
    <div id="hud-build" style="
      position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
      display:none; gap:8px; align-items:center;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-right:4px">BUILD</div>
      ${buildButton('nursery',  '🥚', 'Nursery',   '30🍃')}
      ${buildButton('granary',  '🌾', 'Granary',   '20🍃')}
      ${buildButton('barracks', '⚔️', 'Barracks',  '40🍃')}
      ${buildButton('tunnel',   '🕳', 'Tunnel',    '15🍃')}
    </div>

    <!-- Kill feed top-right -->
    <div id="hud-killfeed" style="
      position:absolute; top:16px; right:16px;
      display:none; flex-direction:column; gap:4px;
      font-family:'Crimson Pro',serif; font-size:12px;
    "></div>

    <!-- Toast container -->
    <div id="toast-container" style="
      position:absolute; bottom:130px; left:50%; transform:translateX(-50%);
      display:flex; flex-direction:column; gap:6px; align-items:center;
      pointer-events:none;
    "></div>

    <!-- Game over screen (hidden) -->
    <div id="gameover-screen" style="
      position:fixed; inset:0; z-index:100;
      background:rgba(7,7,5,0.95); backdrop-filter:blur(12px);
      display:none; flex-direction:column;
      align-items:center; justify-content:center; gap:1.5rem;
    ">
      <div id="gameover-title" style="
        font-family:'Cinzel',serif; font-size:2.5rem; font-weight:800;
        color:#4ade80; letter-spacing:0.15em; text-align:center;
      ">COLONY FALLEN</div>
      <div id="gameover-sub" style="
        font-family:'Crimson Pro',serif; font-size:1.1rem;
        color:#6b6b5a; font-style:italic; text-align:center; max-width:420px;
      "></div>
      <button onclick="location.reload()" style="
        margin-top:1rem; padding:0.75rem 2rem;
        font-family:'Cinzel',serif; font-size:0.8rem;
        font-weight:600; letter-spacing:0.15em;
        background:#4ade80; color:#070705;
        border:none; border-radius:8px; cursor:pointer;
      ">FOUND NEW COLONY</button>
    </div>
  `)

  injectHUDStyles()

  // Build button handlers
  document.querySelectorAll('[data-build]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.build
      // Place chamber at map center for now — proper click-placement coming next
      const x = 1024 + (Math.random() - 0.5) * 200
      const y = 1024 + (Math.random() - 0.5) * 200
      emit.buildChamber(type, { x, y })
    })
  })

  // Reactive store subscription
//   let dayTimer = 240
  useGameStore.subscribe((state) => {
    const { phase, colony, dayPhase, killFeed } = state
    if (phase !== 'playing') return

    // Show all HUD panels once playing
    showHUDPanels()

    // Resources
    const r = colony.resources
    setText('res-leaf',      Math.floor(r.leaf))
    setText('res-fungus',    Math.floor(r.fungus))
    setText('res-honeydew',  Math.floor(r.honeydew))
    setText('res-carapace',  Math.floor(r.carapace))

    // Colony
    const antCount = Object.keys(colony.ants || {}).length
    setText('ant-count',  antCount)
    setText('morale-val', colony.morale)
    setWidth('morale-bar', colony.morale + '%')
    setMoraleColor(colony.morale)

    // Day cycle
    // if (dayTimer > 0) {
    //   dayTimer -= 1
    //   const pct = dayTimer / 240
    //   setWidth('day-bar', pct * 100 + '%')
    // } else {
    //   dayTimer = 240
    // }
    const isDay = dayPhase === 'day'
    setText('day-icon',  isDay ? '☀' : '🌙')
    setText('day-label', isDay ? 'DAY' : 'NIGHT')
    setStyle('day-label', 'color', isDay ? '#fbbf24' : '#818cf8')
    setStyle('day-bar', 'background', isDay ? '#fbbf24' : '#818cf8')

    // Kill feed
    const kf = document.getElementById('hud-killfeed')
    if (kf) kf.innerHTML = killFeed.map(e =>
      `<div class="kill-entry">${e.text}</div>`
    ).join('')
  })
}

function buildButton(type, icon, label, cost) {
  return `
    <button class="build-btn" data-build="${type}" title="${label} (${cost})">
      <span class="build-icon">${icon}</span>
      <span class="build-label">${label}</span>
      <span class="build-cost">${cost}</span>
    </button>
  `
}

let hudVisible = false
function showHUDPanels() {
  if (hudVisible) return
  hudVisible = true
  ;['hud-resources','hud-daycycle','hud-colony','hud-build','hud-killfeed']
    .forEach(id => {
      const el = document.getElementById(id)
      if (el) el.style.display = el.style.display === 'none' ? 'flex' : el.style.display
    })
}

function setText(id, val) {
  const el = document.getElementById(id)
  if (el) el.textContent = val
}
function setWidth(id, val) {
  const el = document.getElementById(id)
  if (el) el.style.width = val
}
function setStyle(id, prop, val) {
  const el = document.getElementById(id)
  if (el) el.style[prop] = val
}
function setMoraleColor(morale) {
  const bar = document.getElementById('morale-bar')
  if (!bar) return
  bar.style.background = morale > 65 ? '#4ade80' : morale > 35 ? '#f59e0b' : '#ef4444'
}

function injectHUDStyles() {
  if (document.getElementById('hud-styles')) return
  const s = document.createElement('style')
  s.id = 'hud-styles'
  s.textContent = `
    .res-row {
      display:flex; align-items:center; gap:8px;
      color:#e8e6d9; font-size:13px;
    }
    .res-icon  { font-size:14px; }
    .res-label { color:#6b6b5a; font-size:11px; margin-left:auto; }
    .build-btn {
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:10px;
      padding:8px 14px; cursor:pointer; color:#e8e6d9;
      display:flex; flex-direction:column; align-items:center; gap:2px;
      transition:all 0.15s; min-width:68px;
    }
    .build-btn:hover {
      border-color:rgba(74,222,128,0.55);
      background:rgba(74,222,128,0.07);
      transform:translateY(-2px);
    }
    .build-icon  { font-size:18px; }
    .build-label {
      font-family:'Cinzel',serif; font-size:8px;
      letter-spacing:0.1em; color:#9ca38f;
    }
    .build-cost  { font-size:10px; color:#4ade80; font-family:'Crimson Pro',serif; }
    .kill-entry {
      background:rgba(7,7,5,0.85); backdrop-filter:blur(8px);
      border:0.5px solid rgba(239,68,68,0.2); border-radius:6px;
      padding:5px 12px; color:#fca5a5; font-size:12px;
      animation: slideIn 0.3s ease both;
    }
    @keyframes slideIn { from { opacity:0; transform:translateX(12px); } }
    .toast {
      padding:8px 20px; border-radius:99px;
      background:rgba(15,15,10,0.95); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2);
      color:#e8e6d9; font-size:13px; font-family:'Crimson Pro',serif;
      opacity:0; transform:translateY(8px);
      transition:all 0.3s ease; pointer-events:none;
    }
    .toast-show  { opacity:1; transform:translateY(0); }
    .toast-error { border-color:rgba(239,68,68,0.4); color:#fca5a5; }
    .toast-info  { border-color:rgba(74,222,128,0.3); }
  `
  document.head.appendChild(s)
}