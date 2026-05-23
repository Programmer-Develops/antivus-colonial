import { emit } from "../socket/client.js"
// ─── ui/hud.js — HUD + controls help panel ───────────────────────────────────
import { useGameStore } from '../store/gameStore.js'

export function initUI(overlay) {
  overlay.insertAdjacentHTML('beforeend', `

    <!-- ── Resources top-left ─────────────────────────────────────────── -->
    <div id="hud-resources" style="
      position:absolute; top:16px; left:16px;
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:10px;
      padding:10px 16px; display:none; flex-direction:column; gap:6px;
      font-family:'Crimson Pro',serif; font-size:14px; min-width:155px;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:2px">COLONY RESOURCES</div>
      <div class="res-row"><span class="res-icon">🍃</span><span id="res-leaf">0</span><span class="res-label">Leaf</span></div>
      <div class="res-row"><span class="res-icon">🍄</span><span id="res-fungus">0</span><span class="res-label">Fungus</span></div>
      <div class="res-row"><span class="res-icon">💧</span><span id="res-honeydew">0</span><span class="res-label">Honeydew</span></div>
      <div class="res-row"><span class="res-icon">🪲</span><span id="res-carapace">0</span><span class="res-label">Carapace</span></div>
    </div>

    <!-- ── Day/night top-center ───────────────────────────────────────── -->
    <div id="hud-daycycle" style="
      position:absolute; top:16px; left:50%; transform:translateX(-50%);
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
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

    <!-- ── Help button top-right ──────────────────────────────────────── -->
    <button id="help-btn" style="
      position:absolute; top:16px; right:16px; display:none;
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.3); border-radius:8px;
      color:#4ade80; font-family:'Cinzel',serif; font-size:11px;
      letter-spacing:0.1em; padding:7px 14px; cursor:pointer;
    ">? CONTROLS</button>

    <!-- ── Selection indicator ────────────────────────────────────────── -->
    <div id="selection-count" style="
      position:absolute; top:58px; left:50%; transform:translateX(-50%);
      background:rgba(74,222,128,0.15); border:0.5px solid rgba(74,222,128,0.4);
      border-radius:99px; padding:4px 16px;
      font-family:'Cinzel',serif; font-size:10px; letter-spacing:0.1em;
      color:#4ade80; opacity:0; transition:opacity 0.2s; pointer-events:none;
    "></div>

    <!-- ── Hint text (center, temporary) ─────────────────────────────── -->
    <div id="hint-text" style="
      position:absolute; top:88px; left:50%; transform:translateX(-50%);
      color:#6b6b5a; font-family:'Crimson Pro',serif; font-size:13px;
      font-style:italic; opacity:0; transition:opacity 0.4s; pointer-events:none;
      white-space:nowrap;
    "></div>

    <!-- ── Colony status bottom-left ─────────────────────────────────── -->
    <div id="hud-colony" style="
      position:absolute; bottom:90px; left:16px;
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
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

    <!-- ── Build panel bottom-center ─────────────────────────────────── -->
    <div id="hud-build" style="
      position:absolute; bottom:16px; left:50%; transform:translateX(-50%);
      display:none; gap:8px; align-items:center;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-right:4px">BUILD</div>
      ${buildButton('nursery',  '🥚', 'Nursery',  '30🍃')}
      ${buildButton('granary',  '🌾', 'Granary',  '20🍃')}
      ${buildButton('barracks', '⚔️', 'Barracks', '40🍃')}
      ${buildButton('tunnel',   '🕳', 'Tunnel',   '15🍃')}
    </div>

    <!-- ── Kill feed top-right (below help btn) ───────────────────────── -->
    <div id="hud-killfeed" style="
      position:absolute; top:56px; right:16px;
      display:none; flex-direction:column; gap:4px;
      font-family:'Crimson Pro',serif; font-size:12px; max-width:220px;
    "></div>

    <!-- ── Toast container ────────────────────────────────────────────── -->
    <div id="toast-container" style="
      position:absolute; bottom:140px; left:50%; transform:translateX(-50%);
      display:flex; flex-direction:column; gap:6px; align-items:center;
      pointer-events:none;
    "></div>

    <!-- ── Controls help modal ────────────────────────────────────────── -->
    <div id="controls-modal" style="
      position:fixed; inset:0; z-index:80; display:none;
      align-items:center; justify-content:center;
      background:rgba(7,7,5,0.75); backdrop-filter:blur(6px);
    ">
      <div style="
        background:#0f0f0a; border:0.5px solid rgba(74,222,128,0.25);
        border-radius:14px; padding:2rem 2.5rem; max-width:460px; width:90%;
        font-family:'Crimson Pro',serif;
      ">
        <div style="font-family:'Cinzel',serif;font-size:1rem;font-weight:600;
          letter-spacing:0.15em;color:#4ade80;margin-bottom:1.5rem;text-align:center">
          COLONY CONTROLS
        </div>

        <div class="ctrl-section">SELECTING ANTS</div>
        <div class="ctrl-row"><span class="ctrl-key">Left click</span><span class="ctrl-desc">on an ant to select it</span></div>
        <div class="ctrl-row"><span class="ctrl-key">A</span><span class="ctrl-desc">select ALL your ants at once</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Esc</span><span class="ctrl-desc">deselect everything</span></div>

        <div class="ctrl-section" style="margin-top:1rem">MOVING ANTS</div>
        <div class="ctrl-row"><span class="ctrl-key">Left click</span><span class="ctrl-desc">on empty ground to move selected ants there</span></div>
        <div class="ctrl-desc-note">Select ants first, then click where you want them to go</div>

        <div class="ctrl-section" style="margin-top:1rem">CAMERA</div>
        <div class="ctrl-row"><span class="ctrl-key">Right click + drag</span><span class="ctrl-desc">pan the map</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Scroll wheel</span><span class="ctrl-desc">zoom in / out</span></div>

        <div class="ctrl-section" style="margin-top:1rem">BUILDING</div>
        <div class="ctrl-row"><span class="ctrl-key">Build buttons</span><span class="ctrl-desc">at the bottom of screen</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Nursery 🥚</span><span class="ctrl-desc">increases spawn rate (30 🍃)</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Granary 🌾</span><span class="ctrl-desc">stores food, boosts income (20 🍃)</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Barracks ⚔️</span><span class="ctrl-desc">raises military ant cap (40 🍃)</span></div>
        <div class="ctrl-row"><span class="ctrl-key">Tunnel 🕳</span><span class="ctrl-desc">fast travel corridor (15 🍃)</span></div>

        <div class="ctrl-section" style="margin-top:1rem">ANT CASTES</div>
        <div class="ctrl-row"><span class="ctrl-key">👑 Diamond</span><span class="ctrl-desc">Queen — protect at all costs</span></div>
        <div class="ctrl-row"><span class="ctrl-key">⚫ Circle</span><span class="ctrl-desc">Worker — collects food</span></div>
        <div class="ctrl-row"><span class="ctrl-key">▪ Square</span><span class="ctrl-desc">Soldier — high HP fighter</span></div>
        <div class="ctrl-row"><span class="ctrl-key">▲ Triangle</span><span class="ctrl-desc">Scout — fast, leaves no trail</span></div>
        <div class="ctrl-row"><span class="ctrl-key">✚ Cross</span><span class="ctrl-desc">Ranger — ranged acid attack</span></div>

        <button id="close-controls" style="
          margin-top:1.5rem; width:100%; padding:0.7rem;
          background:#4ade80; color:#070705; border:none; border-radius:8px;
          font-family:'Cinzel',serif; font-size:0.8rem; font-weight:600;
          letter-spacing:0.1em; cursor:pointer;
        ">GOT IT</button>
      </div>
    </div>

    <!-- ── Game over screen ───────────────────────────────────────────── -->
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
        font-family:'Cinzel',serif; font-size:0.8rem; font-weight:600;
        letter-spacing:0.15em; background:#4ade80; color:#070705;
        border:none; border-radius:8px; cursor:pointer;
      ">FOUND NEW COLONY</button>
    </div>
  `)

  injectHUDStyles()

  // ── Help modal toggle ──────────────────────────────────────────────────────
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('controls-modal').style.display = 'flex'
  })
  document.getElementById('close-controls').addEventListener('click', () => {
    document.getElementById('controls-modal').style.display = 'none'
  })
  document.getElementById('controls-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('controls-modal')) {
      document.getElementById('controls-modal').style.display = 'none'
    }
  })

  // ── Build button handlers ──────────────────────────────────────────────────
  document.querySelectorAll('[data-build]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.build
      const { colonies, myId } = useGameStore.getState()
      const colony = colonies[myId]
      if (!colony) return
      // Place near queen position
      const queen = Object.values(colony.ants).find(a => a.caste === 'queen')
      const base  = queen?.position || { x: 1024, y: 1024 }
      const pos   = {
        x: base.x + (Math.random() - 0.5) * 150,
        y: base.y + (Math.random() - 0.5) * 150
      }
      emit.buildChamber(type, pos)
    })
  })

  // ── Store subscription ─────────────────────────────────────────────────────
  useGameStore.subscribe((state) => {
    const { phase, colony, dayPhase, killFeed } = state
    if (phase !== 'playing') return

    showHUDPanels()

    // Resources
    const r = colony.resources
    setText('res-leaf',     Math.floor(r.leaf))
    setText('res-fungus',   Math.floor(r.fungus))
    setText('res-honeydew', Math.floor(r.honeydew))
    setText('res-carapace', Math.floor(r.carapace))

    // Colony
    const antCount = Object.keys(colony.ants || {}).length
    setText('ant-count',  antCount)
    setText('morale-val', colony.morale)
    setWidth('morale-bar', colony.morale + '%')
    setMoraleColor(colony.morale)

    // Day cycle
    const isDay = dayPhase === 'day'
    setText('day-icon',  isDay ? '☀' : '🌙')
    setText('day-label', isDay ? 'DAY' : 'NIGHT')
    setStyle('day-label', 'color', isDay ? '#fbbf24' : '#818cf8')
    setStyle('day-bar',   'background', isDay ? '#fbbf24' : '#818cf8')

    // Kill feed
    const kf = document.getElementById('hud-killfeed')
    if (kf) kf.innerHTML = killFeed.map(e =>
      `<div class="kill-entry">${e.text}</div>`
    ).join('')
  })

  // Show controls hint on first game entry
  useGameStore.subscribe(
    (s) => s.phase,
    (phase) => {
      if (phase === 'playing') {
        setTimeout(() => {
          // Auto-show controls modal on first play
          if (!localStorage.getItem('antivus_controls_seen')) {
            document.getElementById('controls-modal').style.display = 'flex'
            localStorage.setItem('antivus_controls_seen', '1')
          }
        }, 800)
      }
    }
  )
}

function buildButton(type, icon, label, cost) {
  return `
    <button class="build-btn" data-build="${type}" title="${label} — costs ${cost}">
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
  ;['hud-resources','hud-daycycle','hud-colony','hud-build','hud-killfeed','help-btn','hud-recruit']
    .forEach(id => {
      const el = document.getElementById(id)
      if (el) el.style.display = 'flex'
    })
}

const setText  = (id, v)    => { const e = document.getElementById(id); if (e) e.textContent = v }
const setWidth = (id, v)    => { const e = document.getElementById(id); if (e) e.style.width = v }
const setStyle = (id, p, v) => { const e = document.getElementById(id); if (e) e.style[p] = v }

function setMoraleColor(m) {
  const bar = document.getElementById('morale-bar')
  if (bar) bar.style.background = m > 65 ? '#4ade80' : m > 35 ? '#f59e0b' : '#ef4444'
}

function injectHUDStyles() {
  if (document.getElementById('hud-styles')) return
  const s = document.createElement('style')
  s.id = 'hud-styles'
  s.textContent = `
    .res-row { display:flex; align-items:center; gap:8px; color:#e8e6d9; font-size:13px; }
    .res-icon  { font-size:14px; }
    .res-label { color:#6b6b5a; font-size:11px; margin-left:auto; }

    .build-btn {
      background:rgba(7,7,5,0.88); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:10px;
      padding:8px 14px; cursor:pointer; color:#e8e6d9;
      display:flex; flex-direction:column; align-items:center; gap:2px;
      transition:all 0.15s; min-width:68px;
    }
    .build-btn:hover { border-color:rgba(74,222,128,0.55); background:rgba(74,222,128,0.07); transform:translateY(-2px); }
    .build-icon  { font-size:18px; }
    .build-label { font-family:'Cinzel',serif; font-size:8px; letter-spacing:0.1em; color:#9ca38f; }
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

    .ctrl-section {
      font-family:'Cinzel',serif; font-size:9px; letter-spacing:0.2em;
      color:#4ade80; margin-bottom:6px; margin-top:4px;
    }
    .ctrl-row {
      display:flex; align-items:baseline; gap:10px;
      padding:4px 0; border-bottom:0.5px solid rgba(74,222,128,0.06);
      font-size:13px;
    }
    .ctrl-key {
      background:rgba(74,222,128,0.08); border:0.5px solid rgba(74,222,128,0.2);
      border-radius:4px; padding:1px 7px; font-size:11px; color:#4ade80;
      white-space:nowrap; flex-shrink:0; font-family:'Cinzel',serif;
      letter-spacing:0.05em;
    }
    .ctrl-desc { color:#9ca38f; font-size:13px; }
    .ctrl-desc-note {
      color:#6b6b5a; font-size:12px; font-style:italic;
      margin-top:2px; padding-left:4px;
    }
  `
  document.head.appendChild(s)
}

// ── Recruitment panel (added separately) ─────────────────────────────────────
export function initRecruitPanel(overlay) {
  overlay.insertAdjacentHTML('beforeend', `
    <div id="hud-recruit" style="
      position:absolute; bottom:90px; right:16px; display:none;
      flex-direction:column; gap:6px;
    ">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;
        color:#4ade80;text-align:right;margin-bottom:2px">RECRUIT</div>
      ${recruitBtn('worker',     '⚫', 'Worker',     10,  'Gathers food')}
      ${recruitBtn('soldier',    '▪',  'Soldier',    25,  'Strong fighter')}
      ${recruitBtn('scout',      '▲',  'Scout',      15,  'Fast, no trail')}
      ${recruitBtn('ranger',     '✚',  'Ranger',     30,  'Ranged acid')}
      ${recruitBtn('farmer',     '🍄', 'Farmer',     20,  'Passive income')}
      ${recruitBtn('builder',    '🏗',  'Builder',    20,  'Builds 3x fast')}
      ${recruitBtn('bombardier', '💣', 'Bombardier', 60,  'Suicide bomber')}
    </div>
  `)

  // Show/hide with R key or button
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'r' || e.key === 'R') && useGameStore.getState().phase === 'playing') {
      toggleRecruit()
    }
  })

  document.querySelectorAll('[data-recruit]').forEach(btn => {
    btn.addEventListener('click', () => {
      emit.recruitAnt(btn.dataset.recruit)
    })
  })

  injectRecruitStyles()
}

function recruitBtn(caste, icon, label, cost, tip) {
  return `
    <button class="recruit-btn" data-recruit="${caste}" title="${tip}">
      <span class="recruit-icon">${icon}</span>
      <span class="recruit-label">${label}</span>
      <span class="recruit-cost">${cost}🍃</span>
    </button>
  `
}

function toggleRecruit() {
  const el = document.getElementById('hud-recruit')
  if (!el) return
  el.style.display = el.style.display === 'none' ? 'flex' : 'none'
}

function injectRecruitStyles() {
  if (document.getElementById('recruit-styles')) return
  const s = document.createElement('style')
  s.id = 'recruit-styles'
  s.textContent = `
    .recruit-btn {
      display:flex; align-items:center; gap:8px; padding:7px 12px;
      background:rgba(7,7,5,0.9); backdrop-filter:blur(8px);
      border:0.5px solid rgba(74,222,128,0.2); border-radius:8px;
      cursor:pointer; color:#e8e6d9; transition:all 0.15s;
      font-family:'Crimson Pro',serif; width:170px;
    }
    .recruit-btn:hover { border-color:rgba(74,222,128,0.5); background:rgba(74,222,128,0.06); transform:translateX(-2px); }
    .recruit-icon  { font-size:14px; width:20px; text-align:center; }
    .recruit-label { font-size:13px; flex:1; text-align:left; }
    .recruit-cost  { font-size:11px; color:#4ade80; }
  `
  document.head.appendChild(s)
}