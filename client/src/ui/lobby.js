import { emit }         from '../socket/client.js'
import { useGameStore } from '../store/gameStore.js'
import { getSocket }    from '../socket/client.js'

export function showLobby() {
  const overlay = document.getElementById('ui-overlay')
  const el      = document.createElement('div')
  el.id         = 'lobby-screen'

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

        <!-- Name input shared -->
        <div style="display:flex;justify-content:center;margin-bottom:1rem">
          <input id="colony-name" class="lobby-input" style="max-width:300px;text-align:center"
            placeholder="Name your colony..." maxlength="18" />
        </div>

        <div class="lobby-panels">

          <!-- Quick create -->
          <div class="lobby-panel">
            <div class="panel-title">⚡ FOUND A COLONY</div>
            <div class="panel-desc">Create a new room. Share the room code with friends to invite them.</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <label style="font-size:12px;color:#6b6b5a;white-space:nowrap">Max players</label>
              <select id="max-players" class="lobby-input" style="flex:1;padding:6px 8px">
                <option value="2">2 players</option>
                <option value="4">4 players</option>
                <option value="6" selected>6 players</option>
                <option value="8">8 players</option>
              </select>
            </div>
            <button class="lobby-btn btn-primary" id="btn-create">Found New Colony</button>

            <!-- Room code display (hidden until created) -->
            <div id="room-code-display" style="display:none;margin-top:12px;
              background:#0d0d09;border:0.5px solid rgba(74,222,128,0.3);
              border-radius:8px;padding:10px 14px;text-align:center">
              <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:6px">ROOM CODE — SHARE WITH FRIENDS</div>
              <div id="room-code-val" style="font-family:monospace;font-size:13px;color:#e8e6d9;word-break:break-all"></div>
              <button id="btn-copy-code" style="margin-top:8px;padding:4px 12px;
                background:rgba(74,222,128,0.1);border:0.5px solid rgba(74,222,128,0.3);
                border-radius:6px;color:#4ade80;font-size:11px;cursor:pointer;
                font-family:'Cinzel',serif;letter-spacing:0.1em">COPY CODE</button>
            </div>
          </div>

          <div class="lobby-divider"><span>OR</span></div>

          <!-- Join by code -->
          <div class="lobby-panel">
            <div class="panel-title">🔑 JOIN BY CODE</div>
            <div class="panel-desc">Enter a room code shared by a friend.</div>
            <input id="room-code-input" class="lobby-input" placeholder="Paste room code..." maxlength="36" />
            <button class="lobby-btn btn-secondary" id="btn-join-code">Join Room</button>
          </div>

        </div>

        <!-- Open rooms browser -->
        <div class="lobby-section">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;color:#4ade80">OPEN ROOMS</div>
            <button id="btn-refresh" style="background:none;border:none;color:#6b6b5a;
              font-size:12px;cursor:pointer;font-family:'Crimson Pro',serif">⟳ Refresh</button>
          </div>
          <div id="rooms-list" style="display:flex;flex-direction:column;gap:6px;min-height:60px">
            <div style="color:#3a3a2a;font-size:13px;font-style:italic;text-align:center;padding:16px 0">
              Searching for open rooms...
            </div>
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

  // ── Create room ────────────────────────────────────────────────────────────
  document.getElementById('btn-create').addEventListener('click', () => {
    const name = document.getElementById('colony-name').value.trim() || 'Colony'
    const max  = parseInt(document.getElementById('max-players').value)
    useGameStore.getState().setMyName(name)
    emit.createRoom({ name, maxPlayers: max })
  })

  // ── Show room code after creation ─────────────────────────────────────────
  // Listen for room:joined to display code
  const socket = getSocket()
  if (socket) {
    socket.on('room:joined', ({ roomId }) => {
      const display = document.getElementById('room-code-display')
      const val     = document.getElementById('room-code-val')
      if (display && val) {
        display.style.display = 'block'
        val.textContent       = roomId
      }
    })
  }

  // ── Copy room code ─────────────────────────────────────────────────────────
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    const code = document.getElementById('room-code-val').textContent
    navigator.clipboard.writeText(code).then(() => {
      document.getElementById('btn-copy-code').textContent = '✓ COPIED!'
      setTimeout(() => {
        document.getElementById('btn-copy-code').textContent = 'COPY CODE'
      }, 2000)
    })
  })

  // ── Join by code ───────────────────────────────────────────────────────────
  document.getElementById('btn-join-code').addEventListener('click', () => {
    const name = document.getElementById('colony-name').value.trim() || 'Colony'
    const code = document.getElementById('room-code-input').value.trim()
    if (!code) { document.getElementById('room-code-input').focus(); return }
    useGameStore.getState().setMyName(name)
    emit.joinRoom(code)
  })

  document.getElementById('room-code-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-join-code').click()
  })

  // ── Refresh room list ──────────────────────────────────────────────────────
  document.getElementById('btn-refresh').addEventListener('click', () => {
    const socket = getSocket()
    if (socket) socket.emit('rooms:refresh')
  })

  // ── Room list from server ──────────────────────────────────────────────────
  const listenSocket = getSocket()
  if (listenSocket) {
    listenSocket.on('rooms:list', (list) => renderRoomList(list))
  }
}

function renderRoomList(list) {
  const container = document.getElementById('rooms-list')
  if (!container) return

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div style="color:#3a3a2a;font-size:13px;font-style:italic;text-align:center;padding:16px 0">
        No open rooms — create one and invite friends!
      </div>`
    return
  }

  container.innerHTML = list.map(room => `
    <div class="room-row">
      <div style="flex:1">
        <div style="font-size:13px;color:#e8e6d9">${room.hostName}'s Colony</div>
        <div style="font-size:11px;color:#6b6b5a;margin-top:2px">
          ${room.playerCount}/${room.maxPlayers} players
          <span style="margin:0 6px;opacity:0.3">·</span>
          <span style="font-family:monospace;font-size:10px;opacity:0.5">${room.id.slice(0,8)}...</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <div class="room-dots">
          ${Array.from({length:room.maxPlayers}, (_,i) =>
            `<div class="room-dot ${i < room.playerCount ? 'filled' : ''}"></div>`
          ).join('')}
        </div>
        <button class="join-btn" data-room="${room.id}">JOIN</button>
      </div>
    </div>
  `).join('')

  // Join buttons
  container.querySelectorAll('.join-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = document.getElementById('colony-name').value.trim()
      if (!name) {
        document.getElementById('colony-name').focus()
        document.getElementById('colony-name').placeholder = '← Enter a name first!'
        return
      }
      useGameStore.getState().setMyName(name)
      emit.joinRoom(btn.dataset.room)
    })
  })
}

function spawnParticles() {
  const c = document.getElementById('lobby-particles')
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.cssText = `
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-delay:${Math.random()*8}s;
      animation-duration:${7+Math.random()*10}s;
      width:${2+Math.random()*3}px; height:${2+Math.random()*3}px;
      opacity:${0.1+Math.random()*0.25};
    `
    c.appendChild(p)
  }
}

function injectLobbyStyles() {
  if (document.getElementById('lobby-styles')) return
  const s = document.createElement('style')
  s.id = 'lobby-styles'
  s.textContent = `
    #lobby-screen { position:fixed; inset:0; z-index:50; font-family:'Crimson Pro',serif; }
    .lobby-bg {
      width:100%; height:100%;
      background: radial-gradient(ellipse at 30% 20%, #0d1f0a 0%, #070705 60%);
      display:flex; align-items:center; justify-content:center;
      overflow-y:auto; position:relative;
    }
    .lobby-particles { position:absolute; inset:0; pointer-events:none; }
    .particle {
      position:absolute; background:#4ade80; border-radius:50%;
      animation: float linear infinite;
    }
    @keyframes float { 0%{transform:translateY(0) rotate(0deg)} 100%{transform:translateY(-120vh) rotate(360deg)} }
    .lobby-content {
      position:relative; z-index:2; width:min(800px,95vw);
      display:flex; flex-direction:column; gap:1.5rem;
      padding:2rem 0; animation: fadeUp 0.7s ease both;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    .lobby-header { text-align:center; }
    .lobby-logo { display:inline-flex; align-items:center; gap:1rem; margin-bottom:0.75rem; }
    .logo-ant  { font-size:3rem; filter:drop-shadow(0 0 16px #4ade8077); }
    .logo-main { font-family:'Cinzel',serif; font-size:2.5rem; font-weight:800; color:#e8e6d9; letter-spacing:0.12em; line-height:1; }
    .logo-sub  { font-family:'Cinzel',serif; font-size:0.8rem; font-weight:600; color:#4ade80; letter-spacing:0.35em; }
    .lobby-tagline { font-size:1.05rem; color:#6b6b5a; font-style:italic; }
    .lobby-panels { display:flex; gap:1rem; align-items:flex-start; }
    @media(max-width:580px) { .lobby-panels { flex-direction:column; } }
    .lobby-panel {
      flex:1; background:#0f0f0a;
      border:0.5px solid rgba(74,222,128,0.15); border-radius:12px;
      padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;
      transition:border-color 0.2s;
    }
    .lobby-panel:hover { border-color:rgba(74,222,128,0.3); }
    .panel-title { font-family:'Cinzel',serif; font-size:0.75rem; font-weight:600; letter-spacing:0.2em; color:#4ade80; }
    .panel-desc  { font-size:0.9rem; color:#6b6b5a; line-height:1.5; }
    .lobby-input {
      width:100%; background:#161610; border:0.5px solid rgba(74,222,128,0.2);
      border-radius:8px; padding:0.6rem 1rem; color:#e8e6d9;
      font-family:'Crimson Pro',serif; font-size:1rem; outline:none;
      transition:border-color 0.2s;
    }
    .lobby-input:focus { border-color:rgba(74,222,128,0.6); }
    .lobby-input::placeholder { color:#3a3a2a; }
    select.lobby-input { cursor:pointer; }
    .lobby-btn {
      padding:0.75rem 1.5rem; border-radius:8px;
      font-family:'Cinzel',serif; font-size:0.75rem; font-weight:600;
      letter-spacing:0.1em; cursor:pointer; border:none; transition:all 0.18s;
    }
    .btn-primary  { background:#4ade80; color:#070705; }
    .btn-primary:hover  { background:#86efac; transform:translateY(-1px); box-shadow:0 6px 20px #4ade8033; }
    .btn-secondary { background:transparent; color:#4ade80; border:0.5px solid rgba(74,222,128,0.45); }
    .btn-secondary:hover { background:rgba(74,222,128,0.07); transform:translateY(-1px); }
    .lobby-divider {
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; color:#3a3a2a; font-size:0.8rem;
      letter-spacing:0.1em; padding:0 0.25rem;
    }
    .lobby-section {
      background:#0f0f0a; border:0.5px solid rgba(74,222,128,0.1);
      border-radius:12px; padding:1.25rem 1.5rem;
    }
    .room-row {
      display:flex; align-items:center; gap:12px;
      padding:10px 12px; background:#161610;
      border:0.5px solid rgba(74,222,128,0.1); border-radius:8px;
      transition:border-color 0.15s;
    }
    .room-row:hover { border-color:rgba(74,222,128,0.3); }
    .room-dots { display:flex; gap:3px; }
    .room-dot {
      width:7px; height:7px; border-radius:50%;
      background:rgba(74,222,128,0.15); border:0.5px solid rgba(74,222,128,0.2);
    }
    .room-dot.filled { background:#4ade80; }
    .join-btn {
      padding:5px 14px; background:rgba(74,222,128,0.1);
      border:0.5px solid rgba(74,222,128,0.35); border-radius:6px;
      color:#4ade80; font-family:'Cinzel',serif; font-size:10px;
      letter-spacing:0.1em; cursor:pointer; transition:all 0.15s;
      white-space:nowrap;
    }
    .join-btn:hover { background:rgba(74,222,128,0.2); }
    .lobby-footer { text-align:center; }
    .feature-pills { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; }
    .fpill {
      padding:3px 10px; border-radius:99px;
      border:0.5px solid rgba(74,222,128,0.12);
      font-size:0.78rem; color:#6b6b5a;
    }
  `
  document.head.appendChild(s)
}