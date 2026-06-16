import { emit }         from '../socket/client.js'
import { useGameStore } from '../store/gameStore.js'
import { getSocket }    from '../socket/client.js'

export function showLobby() {
  if (!document.getElementById('lobby-fonts')) {
    const l = document.createElement('link')
    l.id = 'lobby-fonts'
    l.rel = 'stylesheet'
    l.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Outfit:wght@300;400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap'
    document.head.appendChild(l)
  }

  const overlay = document.getElementById('ui-overlay')
  const el      = document.createElement('div')
  el.id         = 'lobby-screen'

  el.innerHTML = `
    <div class="lobby-bg">
      <div class="lobby-grid-overlay"></div>
      <div class="lobby-particles" id="lobby-particles"></div>

      <div class="lobby-content">
        <!-- Logo -->
        <div class="lobby-header">
          <div class="lobby-logo">
            <span class="logo-ant">🐜</span>
            <div class="logo-text">
              <div class="logo-main">ANTIVUS</div>
              <div class="logo-sub">COLONIAL WARS</div>
            </div>
          </div>
          <p class="lobby-tagline">Silicon Valley top-tier biological warfare simulator. Deploy your colony, conquer the arena.</p>
        </div>

        <!-- Center Name Input Box -->
        <div class="console-box">
          <div class="console-badge">COMMANDER SIGN-IN</div>
          <input id="colony-name" class="lobby-input" style="max-width:350px;text-align:center;"
            placeholder="Name your colony..." maxlength="18" />
        </div>

        <!-- Main Cards Grid -->
        <div class="lobby-panels">
          <!-- CARD A: Found Arena -->
          <div class="lobby-panel">
            <div class="panel-icon">⚡</div>
            <div class="panel-title">FOUND COGNITIVE ARENA</div>
            <div class="panel-desc">Spin up a brand-new multiplayer combat arena instantly on our cloud cluster.</div>
            <div class="select-wrapper">
              <label>Maximum Ants</label>
              <select id="max-players" class="lobby-select">
                <option value="2">2 Players (Duels)</option>
                <option value="4">4 Players (Skirmish)</option>
                <option value="6" selected>6 Players (Standard)</option>
                <option value="8">8 Players (Chaos Arena)</option>
              </select>
            </div>
            <button class="lobby-btn btn-primary" id="btn-create">DEPLOY ARENA</button>

            <!-- Deployed code container -->
            <div id="room-code-display" style="display:none;margin-top:12px;
              background:rgba(10,10,14,0.7);border:0.5px solid rgba(74,222,128,0.3);
              border-radius:10px;padding:12px;text-align:center;">
              <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:6px">DEPLOYED CODE — SHARE WITH FRIENDS</div>
              <div id="room-code-val" style="font-family:monospace;font-size:13px;color:#e8e6d9;word-break:break-all;font-weight:700;letter-spacing:0.05em;"></div>
              <button id="btn-copy-code" style="margin-top:8px;padding:5px 14px;
                background:rgba(74,222,128,0.1);border:0.5px solid rgba(74,222,128,0.35);
                border-radius:6px;color:#4ade80;font-size:10px;cursor:pointer;
                font-family:'Cinzel',serif;letter-spacing:0.1em;transition:all 0.15s;">COPY CODE</button>
            </div>
          </div>

          <div class="lobby-divider"><span>OR</span></div>

          <!-- CARD B: Join Code -->
          <div class="lobby-panel">
            <div class="panel-icon">🔑</div>
            <div class="panel-title">ESTABLISH UPLINK BY CODE</div>
            <div class="panel-desc">Inject an active session secure token to connect to your swarm.</div>
            <input id="room-code-input" class="lobby-input" placeholder="Paste session code..." maxlength="36" style="margin-top:auto;" />
            <button class="lobby-btn btn-secondary" id="btn-join-code" style="margin-top:10px;">ESTABLISH LINK</button>
          </div>
        </div>

        <!-- CARD C: Active Server Browser -->
        <div class="lobby-section">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.2em;color:#4ade80;display:flex;align-items:center;gap:6px;">
              <span style="width:6px;height:6px;background:#4ade80;border-radius:50%;display:inline-block;"></span>
              ACTIVE SERVERS BROWSER
            </div>
            <button id="btn-refresh" style="background:none;border:none;color:#9ca38f;
              font-size:12px;cursor:pointer;font-family:'Outfit',sans-serif;font-weight:600;
              transition:all 0.15s;" class="refresh-hover">⟳ Refresh Feed</button>
          </div>
          <div id="rooms-list" style="display:flex;flex-direction:column;gap:8px;min-height:50px">
            <div style="color:#6b6b5a;font-size:13px;font-style:italic;text-align:center;padding:12px 0;font-family:'Outfit',sans-serif">
              Syncing open servers feed...
            </div>
          </div>
        </div>

        <!-- Footer Feature Pills -->
        <div class="lobby-footer">
          <div class="feature-pills">
            <span class="fpill">🧪 Pheromone Turf Speed</span>
            <span class="fpill">🏗 Swarming Drone Nurseries</span>
            <span class="fpill">🌙 Night Predator Bosses</span>
            <span class="fpill">⚔️ 12 Evolved Ant Classes</span>
            <span class="fpill">💥 Chemical Reactions</span>
          </div>
        </div>

      </div>
    </div>
  `

  overlay.appendChild(el)
  injectLobbyStyles()
  spawnParticles()

  document.getElementById('btn-create').addEventListener('click', () => {
    const name = document.getElementById('colony-name').value.trim()
    if (!name) { highlightNameInput(); return }
    const max  = parseInt(document.getElementById('max-players').value)
    useGameStore.getState().setMyName(name)
    emit.createRoom({ name, maxPlayers: max })
  })

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

  document.getElementById('btn-copy-code').addEventListener('click', () => {
    const code = document.getElementById('room-code-val').textContent
    navigator.clipboard.writeText(code).then(() => {
      document.getElementById('btn-copy-code').textContent = '✓ SECURED IN CLIPBOARD!'
      setTimeout(() => {
        document.getElementById('btn-copy-code').textContent = 'COPY CODE'
      }, 2000)
    })
  })

  document.getElementById('btn-join-code').addEventListener('click', () => {
    const name = document.getElementById('colony-name').value.trim()
    if (!name) { highlightNameInput(); return }
    const code = document.getElementById('room-code-input').value.trim()
    if (!code) { document.getElementById('room-code-input').focus(); return }
    useGameStore.getState().setMyName(name)
    emit.joinRoom(code)
  })

  document.getElementById('room-code-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-join-code').click()
  })

  document.getElementById('btn-refresh').addEventListener('click', () => {
    const socket = getSocket()
    if (socket) socket.emit('rooms:refresh')
  })

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
      <div style="color:#6b6b5a;font-size:13px;font-style:italic;text-align:center;padding:12px 0;font-family:'Outfit',sans-serif">
        No active cloud servers — Found a new arena to host!
      </div>`
    return
  }

  container.innerHTML = list.map(room => `
    <div class="room-row">
      <div style="flex:1">
        <div style="font-size:14px;color:#e8e6d9;font-weight:700;font-family:'Outfit',sans-serif;letter-spacing:0.03em;">SWARM CONSOLE: ${room.hostName.toUpperCase()}'S COLONY</div>
        <div style="font-size:11px;color:#9ca38f;margin-top:2px;font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:5px;">
          <span>${room.playerCount} / ${room.maxPlayers} Swarm Connections</span>
          <span style="opacity:0.2">·</span>
          <span style="font-family:monospace;font-size:10px;opacity:0.4">${room.id.slice(0,18)}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <div class="room-dots">
          ${Array.from({length:room.maxPlayers}, (_,i) =>
            `<div class="room-dot ${i < room.playerCount ? 'filled animate-pulse' : ''}"></div>`
          ).join('')}
        </div>
        <button class="join-btn" data-room="${room.id}">CONNECT</button>
      </div>
    </div>
  `).join('')

  container.querySelectorAll('.join-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = document.getElementById('colony-name').value.trim()
      if (!name) {
        document.getElementById('colony-name').focus()
        document.getElementById('colony-name').placeholder = '← COMMANDER NAME FIRST!'
        return
      }
      useGameStore.getState().setMyName(name)
      emit.joinRoom(btn.dataset.room)
    })
  })
}

function spawnParticles() {
  const c = document.getElementById('lobby-particles')
  if (!c) return
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div')
    p.className = 'particle'
    p.style.cssText = `
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation-delay:${Math.random()*6}s;
      animation-duration:${6+Math.random()*8}s;
      width:${2+Math.random()*2.5}px; height:${2+Math.random()*2.5}px;
      opacity:${0.15+Math.random()*0.25};
    `
    c.appendChild(p)
  }
}

function injectLobbyStyles() {
  if (document.getElementById('lobby-styles')) return
  const s = document.createElement('style')
  s.id = 'lobby-styles'
  s.textContent = `
    #lobby-screen { position:fixed; inset:0; z-index:50; font-family:'Outfit',sans-serif; }
    
    /* Responsive scrolling background container */
    .lobby-bg {
      width:100%; height:100%;
      background: radial-gradient(ellipse at 50% 30%, #0c1b0d 0%, #050508 70%);
      display:flex; flex-direction:column; align-items:center;
      overflow-y:auto; overflow-x:hidden; position:relative; padding: 75px 24px 40px 24px;
      box-sizing:border-box;
    }
    
    .lobby-grid-overlay {
      position:absolute; inset:0;
      background-image: linear-gradient(rgba(74,222,128,0.015) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(74,222,128,0.015) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events:none;
    }
    
    .lobby-particles { position:absolute; inset:0; pointer-events:none; }
    .particle {
      position:absolute; background:#4ade80; border-radius:50%;
      box-shadow: 0 0 6px #4ade80cc;
      animation: float linear infinite;
    }
    @keyframes float { 
      0% { transform: translateY(0) scale(1); opacity:0.1; }
      50% { opacity: 0.4; }
      100% { transform: translateY(-110vh) scale(0.6); opacity:0; }
    }

    /* Fixed top status, stays perfectly in place */
    .lobby-top-status {
      position:absolute; top:0; left:0; right:0; padding:14px 24px;
      display:flex; justify-content:space-between; align-items:center;
      border-bottom: 0.5px solid rgba(74,222,128,0.12);
      background: rgba(5,5,8,0.6); backdrop-filter: blur(10px);
      color: #4ade80; z-index:10; font-family:'Outfit',sans-serif;
      box-sizing:border-box;
    }
    .status-dot {
      width:7px; height:7px; background:#4ade80; border-radius:50%;
      box-shadow: 0 0 8px #4ade80ff;
    }
    
    /* Silicon Valley Responsive margins */
    .lobby-content {
      position:relative; z-index:2; width:min(780px,95vw);
      display:flex; flex-direction:column; gap:1.2rem;
      padding:1.5rem 0; margin: auto 0;
      animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
    
    .lobby-header { text-align:center; }
    .lobby-logo { display:inline-flex; align-items:center; gap:1rem; margin-bottom:0.4rem; }
    .logo-ant  { font-size:3.2rem; filter:drop-shadow(0 0 20px rgba(74,222,128,0.45)); }
    .logo-main { font-family:'Cinzel',serif; font-size:2.2rem; font-weight:800; color:#e8e6d9; letter-spacing:0.12em; line-height:1; }
    .logo-sub  { font-family:'Cinzel',serif; font-size:0.85rem; font-weight:600; color:#4ade80; letter-spacing:0.35em; }
    .lobby-tagline { font-size:1.0rem; color:#9ca38f; font-weight:300; max-width:550px; margin: 0 auto; line-height:1.6; }

    .console-box {
      background: rgba(10,10,14,0.7); backdrop-filter: blur(16px);
      border: 0.5px solid rgba(74,222,128,0.18); border-radius:14px;
      padding:1.4rem; display:flex; flex-direction:column; align-items:center; gap:0.6rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    }
    .console-badge {
      font-family:'Cinzel',serif; font-size:9px; font-weight:800; letter-spacing:0.2em; color:#4ade80;
      background:rgba(74,222,128,0.08); padding:2px 10px; border-radius:4px; border:0.5px solid rgba(74,222,128,0.25);
    }

    .lobby-panels { display:flex; gap:1.2rem; align-items:stretch; }
    @media(max-width:680px) { 
      .lobby-panels { flex-direction:column; }
      .lobby-divider { height: 24px; flex-direction: row; margin: 5px 0; }
    }
    
    .lobby-panel {
      flex:1; background: rgba(10,10,14,0.72); backdrop-filter: blur(16px);
      border:0.5px solid rgba(74,222,128,0.15); border-radius:14px;
      padding:1.4rem; display:flex; flex-direction:column; gap:0.75rem;
      transition:all 0.22s; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .lobby-panel:hover { border-color:rgba(74,222,128,0.35); transform:translateY(-3px); box-shadow:0 12px 36px rgba(74,222,128,0.1); }
    .panel-icon { font-size: 26px; }
    .panel-title { font-family:'Cinzel',serif; font-size:0.8rem; font-weight:800; letter-spacing:0.18em; color:#4ade80; }
    .panel-desc  { font-size:0.88rem; color:#9ca38f; line-height:1.55; font-weight:300; }
    
    .select-wrapper { display:flex; flex-direction:column; gap:4px; margin-top:auto; }
    .select-wrapper label { font-size:11px; color:#6b6b5a; font-weight:600; letter-spacing:0.05em; }

    .lobby-input {
      width:100%; background:#101015; border:0.5px solid rgba(74,222,128,0.22);
      border-radius:8px; padding:0.65rem 1rem; color:#e8e6d9;
      font-family:'Outfit',sans-serif; font-size:1.0rem; outline:none;
      transition:all 0.2s; box-shadow: inset 0 2px 8px rgba(0,0,0,0.8);
    }
    .lobby-input:focus { border-color:rgba(74,222,128,0.65); box-shadow: 0 0 10px rgba(74,222,128,0.15); }
    .lobby-input::placeholder { color:#3d3d4a; }
    
    .lobby-select {
      width:100%; background:#101015; border:0.5px solid rgba(74,222,128,0.22);
      border-radius:8px; padding:0.6rem 0.8rem; color:#e8e6d9;
      font-family:'Outfit',sans-serif; font-size:0.92rem; outline:none;
      cursor:pointer; transition:border-color 0.2s;
    }
    .lobby-select:focus { border-color:rgba(74,222,128,0.5); }

    .lobby-btn {
      padding:0.75rem 1.6rem; border-radius:8px;
      font-family:'Cinzel',serif; font-size:0.8rem; font-weight:800;
      letter-spacing:0.12em; cursor:pointer; border:none; transition:all 0.2s;
    }
    .btn-primary  { background:#4ade80; color:#050508; box-shadow: 0 4px 14px rgba(74,222,128,0.3); }
    .btn-primary:hover  { background:#66f099; transform:scale(1.02); box-shadow:0 6px 20px rgba(74,222,128,0.45); }
    .btn-secondary { background:transparent; color:#4ade80; border:0.5px solid rgba(74,222,128,0.45); }
    .btn-secondary:hover { background:rgba(74,222,128,0.07); transform:scale(1.02); border-color:#4ade80; }
    
    .lobby-divider {
      display:flex; flex-direction:column; align-items:center;
      justify-content:center; color:#3d3d4a; font-size:0.75rem;
      font-weight:700; letter-spacing:0.1em; padding:0 0.2rem;
    }
    @media(max-width:680px) {
      .lobby-divider { flex-direction: row; padding: 0.4rem 0; }
    }
    
    .lobby-section {
      background: rgba(10,10,14,0.72); backdrop-filter: blur(16px);
      border:0.5px solid rgba(74,222,128,0.14); border-radius:14px;
      padding:1.1rem 1.4rem; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .refresh-hover:hover { color:#4ade80!important; text-shadow:0 0 6px rgba(74,222,128,0.4); }

    .room-row {
      display:flex; align-items:center; gap:12px;
      padding:10px 14px; background:rgba(255,255,255,0.02);
      border:0.5px solid rgba(74,222,128,0.1); border-radius:10px;
      transition:all 0.18s;
    }
    .room-row:hover { border-color:rgba(74,222,128,0.38); background:rgba(255,255,255,0.04); }
    .room-dots { display:flex; gap:4px; }
    .room-dot {
      width:8px; height:8px; border-radius:50%;
      background:rgba(74,222,128,0.12); border:0.5px solid rgba(74,222,128,0.18);
    }
    .room-dot.filled { background:#4ade80; box-shadow: 0 0 6px #4ade80cc; }
    
    .join-btn {
      padding:6px 16px; background:rgba(74,222,128,0.08);
      border:0.5px solid rgba(74,222,128,0.35); border-radius:6px;
      color:#4ade80; font-family:'Cinzel',serif; font-size:10px;
      font-weight:800; letter-spacing:0.1em; cursor:pointer; transition:all 0.18s;
      white-space:nowrap;
    }
    .join-btn:hover { background:#4ade80; color:#050508; box-shadow: 0 0 12px rgba(74,222,128,0.4); }
    
    .lobby-footer { text-align:center; margin-top:0.4rem; }
    .feature-pills { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
    .fpill {
      padding:4px 12px; border-radius:99px;
      background:rgba(255,255,255,0.02); border:0.5px solid rgba(74,222,128,0.12);
      font-size:0.75rem; color:#9ca38f; font-weight:400;
    }

    @media(max-width:768px) {
      .header-console-text { display:none; }
      .lobby-logo { transform:scale(0.85); transform-origin:center; }
      .lobby-tagline { font-size:0.85rem; }
    }
  `
  document.head.appendChild(s)
}

function highlightNameInput() {
  const el = document.getElementById('colony-name')
  if (!el) return
  el.focus()
  el.style.borderColor = '#ef4444'
  el.style.boxShadow = '0 0 12px rgba(239,68,68,0.3)'
  el.placeholder = '← COMMANDER NAME REQUIRED!'
  setTimeout(() => {
    el.style.borderColor = ''
    el.style.boxShadow = ''
    el.placeholder = 'Name your colony...'
  }, 2200)
}