// ─── ui/lobby.js — Full-screen lobby with create/join room ───────────────────
import { emit }         from '../socket/client.js'
import { useGameStore } from '../store/gameStore.js'

export function showLobby() {
  const overlay = document.getElementById('ui-overlay')

  const el = document.createElement('div')
  el.id = 'lobby-screen'
  el.innerHTML = `
    <div class="lobby-bg">
      <div class="lobby-particles" id="lobby-particles"></div>
      <div class="lobby-content">

        <div class="lobby-header">
          <div class="lobby-logo">
            <span class="logo-ant">🐜</span>
            <div class="logo-text">
              <div class="logo-main">ANTIVUS</div>
              <div class="logo-sub">COLONIAL WARS</div>
            </div>
          </div>
          <p class="lobby-tagline">Command your colony. Conquer the territory. Crush the rivals.</p>
        </div>

        <div class="lobby-panels">

          <div class="lobby-panel">
            <div class="panel-title">⚡ QUICK PLAY</div>
            <div class="panel-desc">Create a new room and share the code with friends</div>
            <div class="name-row">
              <input id="queen-name" class="lobby-input" placeholder="Your colony name..." maxlength="18" />
            </div>
            <button class="lobby-btn btn-primary" id="btn-create">
              Found New Colony
            </button>
          </div>

          <div class="lobby-divider"><span>OR</span></div>

          <div class="lobby-panel">
            <div class="panel-title">🗺 JOIN COLONY</div>
            <div class="panel-desc">Enter a room code to join an existing battle</div>
            <div class="name-row">
              <input id="join-name" class="lobby-input" placeholder="Your colony name..." maxlength="18" />
            </div>
            <div class="name-row">
              <input id="room-code" class="lobby-input" placeholder="Room code..." maxlength="36" />
            </div>
            <button class="lobby-btn btn-secondary" id="btn-join">
              Join Battle
            </button>
          </div>

        </div>

        <div class="lobby-footer">
          <div class="feature-pills">
            <span class="fpill">🧪 Pheromone trails</span>
            <span class="fpill">🏗 Nest building</span>
            <span class="fpill">🌙 Day/night cycle</span>
            <span class="fpill">🐛 Predator events</span>
            <span class="fpill">⚔️ 8 ant castes</span>
          </div>
        </div>

      </div>
    </div>
  `

  overlay.appendChild(el)
  injectLobbyStyles()
  spawnParticles()

  // ── Button handlers ────────────────────────────────────────────────────────
  document.getElementById('btn-create').addEventListener('click', () => {
    const name = document.getElementById('queen-name').value.trim() || 'Queen'
    useGameStore.getState().setMyName(name)
    emit.createRoom({ name, maxPlayers: 6 })
  })

  document.getElementById('btn-join').addEventListener('click', () => {
    const name = document.getElementById('join-name').value.trim() || 'Queen'
    const code = document.getElementById('room-code').value.trim()
    if (!code) { document.getElementById('room-code').focus(); return }
    useGameStore.getState().setMyName(name)
    emit.joinRoom(code)
  })

  // Enter key on room code input
  document.getElementById('room-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-join').click()
  })
}

function spawnParticles() {
  const c = document.getElementById('lobby-particles')
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-delay:${Math.random()*8}s;
      animation-duration:${6+Math.random()*10}s;
      width:${2+Math.random()*4}px;
      height:${2+Math.random()*4}px;
      opacity:${0.1+Math.random()*0.3};
    `
    c.appendChild(p)
  }
}

function injectLobbyStyles() {
  if (document.getElementById('lobby-styles')) return
  const s = document.createElement('style')
  s.id = 'lobby-styles'
  s.textContent = `
    #lobby-screen {
      position:fixed; inset:0; z-index:50;
      font-family:'Crimson Pro',serif;
    }
    .lobby-bg {
      width:100%; height:100%;
      background: radial-gradient(ellipse at 30% 20%, #0d1f0a 0%, #070705 60%);
      display:flex; align-items:center; justify-content:center;
      overflow:hidden; position:relative;
    }
    .lobby-particles { position:absolute; inset:0; pointer-events:none; }
    .particle {
      position:absolute; background:#4ade80; border-radius:50%;
      animation: float linear infinite;
    }
    @keyframes float {
      0%   { transform:translateY(0)    rotate(0deg);   }
      100% { transform:translateY(-120vh) rotate(360deg); }
    }
    .lobby-content {
      position:relative; z-index:2; width:min(860px,95vw);
      display:flex; flex-direction:column; gap:2.5rem;
      animation: fadeUp 0.8s ease both;
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(32px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .lobby-header { text-align:center; }
    .lobby-logo {
      display:inline-flex; align-items:center; gap:1.2rem;
      margin-bottom:1rem;
    }
    .logo-ant  { font-size:3.5rem; filter:drop-shadow(0 0 20px #4ade8088); }
    .logo-main {
      font-family:'Cinzel',serif; font-size:3rem; font-weight:800;
      color:#e8e6d9; letter-spacing:0.12em; line-height:1;
    }
    .logo-sub  {
      font-family:'Cinzel',serif; font-size:0.85rem; font-weight:600;
      color:#4ade80; letter-spacing:0.35em;
    }
    .lobby-tagline {
      font-size:1.15rem; color:#6b6b5a; font-style:italic; letter-spacing:0.02em;
    }
    .lobby-panels {
      display:flex; gap:1.5rem; align-items:stretch;
    }
    @media(max-width:600px) { .lobby-panels { flex-direction:column; } }
    .lobby-panel {
      flex:1; background:#0f0f0a;
      border:0.5px solid rgba(74,222,128,0.15);
      border-radius:12px; padding:1.75rem;
      display:flex; flex-direction:column; gap:1rem;
      transition:border-color 0.2s;
    }
    .lobby-panel:hover { border-color:rgba(74,222,128,0.35); }
    .panel-title {
      font-family:'Cinzel',serif; font-size:0.8rem;
      font-weight:600; letter-spacing:0.2em;
      color:#4ade80;
    }
    .panel-desc { font-size:0.95rem; color:#6b6b5a; line-height:1.5; }
    .name-row   { display:flex; }
    .lobby-input {
      flex:1; background:#161610;
      border:0.5px solid rgba(74,222,128,0.2);
      border-radius:8px; padding:0.65rem 1rem;
      color:#e8e6d9; font-family:'Crimson Pro',serif;
      font-size:1rem; outline:none;
      transition:border-color 0.2s;
    }
    .lobby-input:focus { border-color:rgba(74,222,128,0.6); }
    .lobby-input::placeholder { color:#3a3a2a; }
    .lobby-btn {
      padding:0.8rem 1.5rem; border-radius:8px;
      font-family:'Cinzel',serif; font-size:0.8rem;
      font-weight:600; letter-spacing:0.1em;
      cursor:pointer; border:none;
      transition:all 0.2s; margin-top:auto;
    }
    .btn-primary {
      background:#4ade80; color:#070705;
    }
    .btn-primary:hover  { background:#86efac; transform:translateY(-1px); box-shadow:0 8px 24px #4ade8033; }
    .btn-secondary {
      background:transparent; color:#4ade80;
      border:0.5px solid rgba(74,222,128,0.5);
    }
    .btn-secondary:hover { background:rgba(74,222,128,0.08); transform:translateY(-1px); }
    .lobby-divider {
      display:flex; align-items:center; flex-direction:column;
      justify-content:center; color:#3a3a2a; font-size:0.8rem;
      letter-spacing:0.1em; padding:0 0.5rem;
    }
    .lobby-footer { text-align:center; }
    .feature-pills { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
    .fpill {
      padding:4px 12px; border-radius:99px;
      border:0.5px solid rgba(74,222,128,0.15);
      font-size:0.82rem; color:#6b6b5a;
    }
  `
  document.head.appendChild(s)
}