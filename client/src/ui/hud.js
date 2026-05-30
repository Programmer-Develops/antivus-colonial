import { useGameStore }        from '../store/gameStore.js'
import { emit }                from '../socket/client.js'
import { startPlacingChamber } from '../game/input.js'

// ── Cache of last-rendered values so we only touch DOM on actual change ────────
const _last = {}
function _set(id, val) {
  if (_last[id] === val) return
  _last[id] = val
  const el = document.getElementById(id)
  if (el) el.textContent = val
}
function _style(id, prop, val) {
  const key = id + prop
  if (_last[key] === val) return
  _last[key] = val
  const el = document.getElementById(id)
  if (el) el.style[prop] = val
}

export function initUI(overlay) {
  overlay.insertAdjacentHTML('beforeend', `
    <!-- Top-Left: Resources -->
    <div id="hud-resources" style="position:absolute;top:16px;left:16px;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:12px 18px;display:none;flex-direction:column;gap:6px;
      font-family:'Crimson Pro',serif;font-size:14px;min-width:160px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:4px">NEST RESOURCES</div>
      <div class="res-row"><span class="res-icon">🍃</span><span id="res-leaf">0</span><span class="res-label">Leaf Points</span></div>
      <div class="res-row"><span class="res-icon">🪲</span><span id="res-carapace">0</span><span class="res-label">Carapaces</span></div>
    </div>

    <!-- Top-Center: Day/Night cycle -->
    <div id="hud-daycycle" style="position:absolute;top:16px;left:50%;transform:translateX(-50%);
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:99px;
      padding:7px 22px;display:none;align-items:center;gap:12px;
      font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.12em;
      box-shadow:0 6px 24px rgba(0,0,0,0.55);">
      <span id="day-icon">☀</span>
      <span id="day-label" style="color:#fbbf24">DAY</span>
      <div style="width:90px;height:4px;background:#1b1b22;border-radius:2px;overflow:hidden">
        <div id="day-bar" style="height:100%;background:#fbbf24;width:100%;border-radius:2px"></div>
      </div>
    </div>

    <!-- Top-Right: Controls button -->
    <button id="help-btn" style="position:absolute;top:16px;right:16px;display:none;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.3);border-radius:8px;
      color:#4ade80;font-family:'Cinzel',serif;font-size:11px;
      letter-spacing:0.1em;padding:7px 16px;cursor:pointer;
      transition:all 0.18s;box-shadow:0 4px 16px rgba(0,0,0,0.4);">? HOW TO PLAY</button>

    <!-- Top-Center-Below: Evolution choices panel (neon glassmorphic dropdown cards) -->
    <div id="hud-evolution" style="position:absolute;top:80px;left:50%;transform:translateX(-50%);
      display:none;flex-direction:column;align-items:center;gap:10px;z-index:90;">
      <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;
        letter-spacing:0.2em;color:#4ade80;text-shadow:0 0 10px rgba(74,222,128,0.6);
        background:rgba(10,10,14,0.9);backdrop-filter:blur(8px);
        padding:4px 20px;border-radius:99px;border:0.5px solid rgba(74,222,128,0.2)">
        ▲ EVOLUTION CHOOSE AN ANT CLASS ▲
      </div>
      <div id="evolve-cards-list" style="display:flex;gap:16px;justify-content:center;"></div>
    </div>

    <!-- Bottom-Left: Glassmorphic Stat Upgrade Sidebar -->
    <div id="hud-stats-panel" style="position:absolute;bottom:100px;left:16px;
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:14px 18px;display:none;flex-direction:column;gap:10px;
      font-family:'Crimson Pro',serif;min-width:210px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:#4ade80;margin-bottom:2px">
        ANT STAT UPGRADES <span id="stat-points-avail" style="float:right;color:#fbbf24;font-weight:700;"></span>
      </div>
      <div class="stat-upgrade-row" data-stat="regen">
        <span class="stat-lbl">🩹 Regen</span>
        <div class="stat-blocks" id="blocks-regen"></div>
        <button class="stat-add-btn" id="btn-add-regen">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="maxHp">
        <span class="stat-lbl">❤️ Health</span>
        <div class="stat-blocks" id="blocks-maxHp"></div>
        <button class="stat-add-btn" id="btn-add-maxHp">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="speed">
        <span class="stat-lbl">💨 Speed</span>
        <div class="stat-blocks" id="blocks-speed"></div>
        <button class="stat-add-btn" id="btn-add-speed">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="damage">
        <span class="stat-lbl">💥 Damage</span>
        <div class="stat-blocks" id="blocks-damage"></div>
        <button class="stat-add-btn" id="btn-add-damage">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="bulletSpeed">
        <span class="stat-lbl">🚀 Range</span>
        <div class="stat-blocks" id="blocks-bulletSpeed"></div>
        <button class="stat-add-btn" id="btn-add-bulletSpeed">+</button>
      </div>
      <div class="stat-upgrade-row" data-stat="reload">
        <span class="stat-lbl">⏱️ Reload</span>
        <div class="stat-blocks" id="blocks-reload"></div>
        <button class="stat-add-btn" id="btn-add-reload">+</button>
      </div>
    </div>

    <!-- Bottom-Center: Sleek XP and Level indicators -->
    <div id="hud-level-bar" style="position:absolute;bottom:16px;left:50%;transform:translateX(-50%);
      background:rgba(10,10,14,0.85);backdrop-filter:blur(12px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:10px;
      padding:10px 24px;display:none;align-items:center;gap:14px;
      min-width:380px;box-shadow:0 8px 32px rgba(0,0,0,0.65);">
      <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#e8e6d9;">
        LVL <span id="hud-lvl-val">1</span>
      </div>
      <div style="flex:1;height:6px;background:#1b1b22;border-radius:3px;overflow:hidden;position:relative;">
        <div id="hud-xp-fill" style="height:100%;background:linear-gradient(to right, #4ade80, #34d399);width:0%;border-radius:3px;transition:width 0.4s ease;"></div>
      </div>
      <div style="font-family:monospace;font-size:11px;color:#9ca38f;">
        <span id="hud-xp-val">0</span> / <span id="hud-xp-max">40</span> XP
      </div>
    </div>

    <!-- Bottom-Center-Above: Nest deploy buttons (RTS-IO elements) -->
    <div id="hud-build" style="position:absolute;bottom:76px;left:50%;transform:translateX(-50%);
      display:none;gap:8px;align-items:center;">
      <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.18em;
        color:#4ade80;margin-right:6px;text-align:right;">NEST DEPLOY<br><span style="color:#6b6b5a;font-size:7px;">(B KEY)</span></div>
      ${_bBtn('nursery',  '🥚', 'Nursery',  '50🍃', 'Larva Swarm Nest - breeds AI follower drones')}
      ${_bBtn('granary',  '🌾', 'Granary',  '25🍃', 'Sustenance depot - slowly heals allies')}
      ${_bBtn('barracks', '⚔️', 'Barracks', '40🍃', 'Shield wall - blocks and damages enemies')}
      ${_bBtn('tunnel',   '🕳', 'Tunnel',   '30🍃', 'Warp Portal & auto-turret')}
    </div>

    <!-- Top-Right-Below: Kill feed -->
    <div id="hud-killfeed" style="position:absolute;top:58px;right:16px;
      display:none;flex-direction:column;gap:4px;max-width:260px;
      font-family:'Crimson Pro',serif;font-size:12px;"></div>

    <!-- Toast container -->
    <div id="toast-container" style="position:absolute;bottom:145px;left:50%;
      transform:translateX(-50%);display:flex;flex-direction:column;
      gap:6px;align-items:center;pointer-events:none;"></div>

    <!-- Controls modal (Refined top-down shooter guide) -->
    <div id="controls-modal" style="position:fixed;inset:0;z-index:180;display:none;
      align-items:center;justify-content:center;
      background:rgba(5,5,8,0.85);backdrop-filter:blur(8px);">
      <div style="background:#0a0a0f;border:0.5px solid rgba(74,222,128,0.3);
        border-radius:16px;padding:2.2rem 2.8rem;max-width:500px;width:92%;
        font-family:'Crimson Pro',serif;max-height:86vh;overflow-y:auto;
        box-shadow:0 12px 48px rgba(0,0,0,0.8);">
        <div style="font-family:'Cinzel',serif;font-size:1.15rem;font-weight:700;
          letter-spacing:0.18em;color:#4ade80;margin-bottom:1.5rem;text-align:center;
          text-shadow:0 0 10px rgba(74,222,128,0.4)">ANTIVUS SHOOTER GUIDE</div>

        <div class="ctrl-s">MOVEMENT & AIMING</div>
        <div class="ctrl-r"><span class="ctrl-k">W, A, S, D</span><span class="ctrl-d">Directly move your Ant</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Mouse Move</span><span class="ctrl-d">Aim your chemical acid/needles</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Left Click</span><span class="ctrl-d">Hold to continuously shoot</span></div>
        <div class="ctrl-r"><span class="ctrl-k">E Key</span><span class="ctrl-d">Toggle Continuous Auto-Fire</span></div>
        <div class="ctrl-r"><span class="ctrl-k">Shift Key</span><span class="ctrl-d">Active Class Skill (e.g. Dash / Poison clouds)</span></div>

        <div class="ctrl-s" style="margin-top:1.2rem">LEVELING & STAT UPGRADES</div>
        <p class="ctrl-note">Shoot wild **food shapes** (Leaf Chunks 🍃, Sugar Crystals 🌾) or defeat enemy ants to gain XP. Leveling up grants stat points. Click '[+]' in the bottom-left to upgrade your ant's Regen, Health, Speed, Damage, Range, and Reload!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">EVOLUTION TIER DROPDOWN</div>
        <p class="ctrl-note">At **Level 5** and **Level 15**, choose your specialized class from the evolution panel! Upgrade into heavy Soldier biting tanks, fast Scouts, range Snipers, or healing Farmers!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">PHEROMONE TURF CONTROL ( turf war )</div>
        <p class="ctrl-note">Walking paints the tiles with your colony's color. Friendly ants running on your color get **+35% Speed & high regen**! Enemies stepping on your color are **slowed by 25%**.</p>

        <div class="ctrl-s" style="margin-top:1.2rem">NIGHT SURVIVAL BOSS EVENTS</div>
        <p class="ctrl-note">At Night, the arena goes dark and spotlights fade in. Glowing neon **Giant Wolf Spiders** spawn and hunt players. Team up or fortify your nest to survive!</p>

        <div class="ctrl-s" style="margin-top:1.2rem">NEST CHAMBER DEPLOY (B KEY)</div>
        <div class="ctrl-r"><span class="ctrl-k">🥚 Nursery</span><span class="ctrl-d">Spawns mini AI drone-ants that protect you</span></div>
        <div class="ctrl-r"><span class="ctrl-k">🕳 Tunnel</span><span class="ctrl-d">Shoots acid turrets and acts as a warp portal</span></div>
        <div class="ctrl-r"><span class="ctrl-k">⚔️ Barracks</span><span class="ctrl-d">High-HP shield barricade dealing touch damage</span></div>

        <button id="close-controls" style="margin-top:1.8rem;width:100%;padding:0.75rem;
          background:#4ade80;color:#070705;border:none;border-radius:8px;
          font-family:'Cinzel',serif;font-size:0.8rem;font-weight:700;
          letter-spacing:0.12em;cursor:pointer;transition:all 0.18s;
          box-shadow:0 4px 12px rgba(74,222,128,0.35);">GOT IT</button>
      </div>
    </div>

    <!-- Game over -->
    <div id="gameover-screen" style="position:fixed;inset:0;z-index:200;
      background:rgba(5,5,8,0.96);backdrop-filter:blur(16px);
      display:none;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;">
      <div id="gameover-title" style="font-family:'Cinzel',serif;font-size:2.8rem;
        font-weight:800;color:#4ade80;letter-spacing:0.18em;text-shadow:0 0 20px rgba(74,222,128,0.4);text-align:center;"></div>
      <div id="gameover-sub" style="font-family:'Crimson Pro',serif;font-size:1.15rem;
        color:#9ca38f;font-style:italic;text-align:center;max-width:440px;"></div>
      <button onclick="location.reload()" style="margin-top:1rem;padding:0.8rem 2.2rem;
        font-family:'Cinzel',serif;font-size:0.8rem;font-weight:700;
        letter-spacing:0.15em;background:#4ade80;color:#070705;
        border:none;border-radius:8px;cursor:pointer;box-shadow:0 6px 18px rgba(74,222,128,0.45);">RESPAWN NEW CLASS</button>
    </div>
  `)

  injectStyles()

  // Modal events
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('controls-modal').style.display = 'flex'
  })
  document.getElementById('close-controls').addEventListener('click', () => {
    document.getElementById('controls-modal').style.display = 'none'
  })
  document.getElementById('controls-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('controls-modal'))
      document.getElementById('controls-modal').style.display = 'none'
  })

  // Build deployment
  document.querySelectorAll('[data-build]').forEach(btn => {
    btn.addEventListener('click', () => startPlacingChamber(btn.dataset.build))
  })

  // Hook up Stat upgrade clicks
  ;['regen', 'maxHp', 'speed', 'damage', 'bulletSpeed', 'reload'].forEach(stat => {
    const btn = document.getElementById(`btn-add-${stat}`)
    if (btn) {
      btn.addEventListener('click', () => {
        emit.upgradeStat(stat)
      })
    }
  })

  // ── Unified Zustand Game Store Subscriber ──────────────────────────────────
  useGameStore.subscribe((state) => {
    const { phase, colony, dayPhase, killFeed, myId } = state
    if (phase !== 'playing') return

    _showHUDPanels()

    // 1. Ingest Resources
    const r = colony.resources || {}
    _set('res-leaf',     Math.floor(r.leaf     ?? 0))
    _set('res-carapace', Math.floor(r.carapace ?? 0))

    // 2. Ingest Level & XP progress bar
    _set('hud-lvl-val', colony.level ?? 1)
    _set('hud-xp-val', Math.round(colony.xp ?? 0))
    const maxXP = 40 + (colony.level ?? 1) * 10
    _set('hud-xp-max', maxXP)
    const xpPct = Math.min(100, ((colony.xp ?? 0) / maxXP) * 100)
    _style('hud-xp-fill', 'width', xpPct + '%')

    // 3. Stat upgrade slots drawing
    _updateStatUpgradesPanel(colony)

    // 4. Evolution panel triggers
    _updateEvolutionPanel(colony)

    // 5. Day/night icon sync
    const isDay = dayPhase === 'day'
    _set('day-icon',  isDay ? '☀' : '🌙')
    _set('day-label', isDay ? 'DAY' : 'NIGHT')
    _style('day-label', 'color', isDay ? '#fbbf24' : '#a78bfa')
    _style('day-bar',   'background', isDay ? '#fbbf24' : '#a78bfa')

    // 6. Kill feed HTML sync
    const kfEl = document.getElementById('hud-killfeed')
    const kfHTML = (killFeed || []).map(e =>
      `<div class="kill-entry">${e.text}</div>`).join('')
    if (kfEl && kfEl.innerHTML !== kfHTML) kfEl.innerHTML = kfHTML
  })

  // Show help modal on very first load
  useGameStore.subscribe(s => s.phase, (phase) => {
    if (phase !== 'playing') return
    setTimeout(() => {
      if (!localStorage.getItem('antivus_shooter_seen')) {
        document.getElementById('controls-modal').style.display = 'flex'
        localStorage.setItem('antivus_shooter_seen', '1')
      }
    }, 600)
  })
}

// ── Render Glassmorphic Stat Blocks ──────────────────────────────────────────
function _updateStatUpgradesPanel(colony) {
  const points = colony.upgradePoints ?? 0
  const elAvail = document.getElementById('stat-points-avail')
  if (elAvail) {
    elAvail.textContent = points > 0 ? `(${points} PTS)` : ''
    elAvail.style.color = points > 0 ? '#fbbf24' : '#4ade80'
  }

  const stats = colony.stats || {}
  ;['regen', 'maxHp', 'speed', 'damage', 'bulletSpeed', 'reload'].forEach(stat => {
    const allocated = stats[stat] ?? 0
    const blocksContainer = document.getElementById(`blocks-${stat}`)
    if (blocksContainer) {
      let blocksHTML = ''
      for (let i = 1; i <= 7; i++) {
        const fillClass = i <= allocated ? 'stat-block-filled' : 'stat-block-empty'
        blocksHTML += `<div class="stat-block-slot ${fillClass}"></div>`
      }
      if (blocksContainer.innerHTML !== blocksHTML) blocksContainer.innerHTML = blocksHTML
    }

    // Toggle upgrade button visibility
    const btn = document.getElementById(`btn-add-${stat}`)
    if (btn) {
      if (points > 0 && allocated < 7) {
        btn.style.display = 'inline-flex'
      } else {
        btn.style.display = 'none'
      }
    }
  })
}

// ── Evolve ant cards list ───────────────────────────────────────────────────
// Cache last evolve choices so we don't recreate DOM cards unnecessarily
let _lastEvolveKey = ''
const EVOLVE_DEFS = {
  // Tier 2 (from Lvl 5 worker)
  soldier: { emoji:'⚔️', title:'Soldier', desc:'Heavy biting tank. Extreme HP, strong melee tusk spray.', color:'#f87171' },
  scout:   { emoji:'▲', title:'Scout',   desc:'Super fast. Rapid fires poison needles. Active Dash (Shift).', color:'#60a5fa' },
  ranger:  { emoji:'✚', title:'Ranger',  desc:'Long range. Heavy acid spitting blobs.', color:'#34d399' },
  farmer:  { emoji:'🍄', title:'Farmer',  desc:'Honeydew healing droplets, high leaf income gathering aura.', color:'#fb923c' },
  // Tier 3
  bombardier: { emoji:'💣', title:'Bombardier', desc:'Heavy chemical explosive spores. Explodes on death!', color:'#ef4444' },
  weaver:     { emoji:'🕸️', title:'Weaver',     desc:'Fires sticky silk webs to trap targets. Build strong chambers.', color:'#a78bfa' },
  bullet:     { emoji:'🚀', title:'Bullet Ant',  desc:'Single needle extremely high pierce damage. Rapid speed.', color:'#38bdf8' },
  stinkbug:   { emoji:'☣️', title:'Stinkbug',    desc:'Defensive poison trails on Shift. Toxic HP-draining aura.', color:'#c084fc' },
  acidgunner: { emoji:'🔫', title:'Acid Gunner', desc:'Fires three-way spreading chemical acid streams.', color:'#4ade80' },
  sniper:     { emoji:'🎯', title:'Sniper Ant',  desc:'Fires ultra range needle spikes. High pierce damage.', color:'#f43f5e' },
  cultivator: { emoji:'🌳', title:'Cultivator',  desc:'Fires spores that grow toxic cloud fields. Deploy follower swarms.', color:'#fb923c' }
}

function _updateEvolutionPanel(colony) {
  const lvl = colony.level ?? 1
  const curClass = colony.class

  let choices = []
  if (lvl >= 5 && lvl < 15 && curClass === 'worker') {
    choices = ['soldier', 'scout', 'ranger', 'farmer']
  } else if (lvl >= 15) {
    if (curClass === 'soldier')    choices = ['bombardier', 'weaver']
    else if (curClass === 'scout') choices = ['bullet', 'stinkbug']
    else if (curClass === 'ranger') choices = ['acidgunner', 'sniper']
    else if (curClass === 'farmer') choices = ['cultivator']
  }

  const key = choices.join('-')
  const el = document.getElementById('hud-evolution')

  if (choices.length === 0) {
    if (el) el.style.display = 'none'
    _lastEvolveKey = ''
    return
  }

  if (_lastEvolveKey === key) {
    if (el) el.style.display = 'flex'
    return
  }
  _lastEvolveKey = key

  // Render cards
  const container = document.getElementById('evolve-cards-list')
  if (container) {
    container.innerHTML = choices.map(cName => {
      const def = EVOLVE_DEFS[cName] || { emoji:'🐜', title:cName.toUpperCase(), desc:'Specialized Caste', color:'#ffffff' }
      return `
        <div class="evolve-card" style="--c:${def.color};" onclick="window.antEvolve('${cName}')">
          <div class="evolve-card-emoji">${def.emoji}</div>
          <div class="evolve-card-title">${def.title}</div>
          <div class="evolve-card-desc">${def.desc}</div>
          <button class="evolve-card-btn">SELECT CASTE</button>
        </div>
      `
    }).join('')
  }

  el.style.display = 'flex'
}

// Global evolve trigger binder
window.antEvolve = function(cName) {
  emit.evolve(cName)
}

export function initRecruitPanel(overlay) {
  // recruitment panel is removed in Arras overhauled. Keep blank placeholder for boot sequence
}

let _hudShown = false
function _showHUDPanels() {
  if (_hudShown) return
  _hudShown = true
  ;['hud-resources','hud-daycycle','hud-stats-panel','hud-level-bar','hud-build','hud-killfeed','help-btn']
    .forEach(id => {
      const el = document.getElementById(id)
      if (el) el.style.display = 'flex'
    })
}

function _bBtn(type, icon, label, cost, tip) {
  return `<button class="build-btn" data-build="${type}" title="${tip}">
    <span class="build-icon">${icon}</span>
    <span class="build-label">${label}</span>
    <span class="build-cost">${cost}</span>
  </button>`
}

function injectStyles() {
  if (document.getElementById('hud-styles')) return
  const s = document.createElement('style')
  s.id = 'hud-styles'
  s.textContent = `
    .res-row{display:flex;align-items:center;gap:10px;color:#e8e6d9;font-size:13px}
    .res-icon{font-size:15px}.res-label{color:#9ca38f;font-size:11px;margin-left:auto}
    .build-btn{background:rgba(10,10,14,0.85);backdrop-filter:blur(10px);
      border:0.5px solid rgba(74,222,128,0.22);border-radius:12px;
      padding:8px 14px;cursor:pointer;color:#e8e6d9;
      display:flex;flex-direction:column;align-items:center;gap:3px;
      transition:all 0.18s;min-width:76px;box-shadow:0 6px 18px rgba(0,0,0,0.5);}
    .build-btn:hover{border-color:#4ade80;background:rgba(74,222,128,0.08);transform:translateY(-3px);box-shadow:0 8px 24px rgba(74,222,128,0.22);}
    .build-icon{font-size:19px}.build-label{font-family:'Cinzel',serif;font-size:8px;
      letter-spacing:0.12em;color:#9ca38f}.build-cost{font-size:10px;color:#4ade80;font-weight:700;}

    /* Stat Upgrade Rows */
    .stat-upgrade-row{display:flex;align-items:center;gap:10px;padding:3px 0;height:24px}
    .stat-lbl{font-size:13px;color:#e8e6d9;min-width:65px;font-family:'Crimson Pro',serif}
    .stat-blocks{display:flex;gap:4px;flex:1;align-items:center}
    .stat-block-slot{width:10px;height:12px;border-radius:2px;border:0.5px solid rgba(74,222,128,0.18)}
    .stat-block-filled{background:#4ade80;box-shadow:0 0 4px #4ade80aa}
    .stat-block-empty{background:rgba(255,255,255,0.03)}
    .stat-add-btn{width:16px;height:16px;border-radius:4px;border:none;background:#fbbf24;
      color:#070705;font-weight:800;font-size:11px;display:none;align-items:center;justify-content:center;
      cursor:pointer;transition:transform 0.15s;}
    .stat-add-btn:hover{transform:scale(1.15)}

    /* Evolution Cards Overlay */
    .evolve-card{background:rgba(10,10,15,0.86);backdrop-filter:blur(14px);
      border:0.5px solid rgba(255,255,255,0.1);border-radius:12px;
      padding:16px 20px;width:180px;display:flex;flex-direction:column;
      align-items:center;text-align:center;gap:10px;cursor:pointer;
      transition:all 0.22s;box-shadow:0 8px 32px rgba(0,0,0,0.65);}
    .evolve-card:hover{border-color:var(--c);transform:translateY(-6px);box-shadow:0 12px 36px var(--c)3a}
    .evolve-card-emoji{font-size:32px;filter:drop-shadow(0 0 10px var(--c)77)}
    .evolve-card-title{font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:#e8e6d9;letter-spacing:0.08em}
    .evolve-card-desc{font-size:11px;color:#9ca38f;line-height:1.4;height:45px;display:flex;align-items:center;justify-content:center}
    .evolve-card-btn{width:100%;padding:6px;border:0.5px solid var(--c);border-radius:6px;
      background:none;color:var(--c);font-family:'Cinzel',serif;font-size:8px;
      font-weight:700;letter-spacing:0.08em;cursor:pointer;transition:all 0.15s;}
    .evolve-card:hover .evolve-card-btn{background:var(--c);color:#070705}

    .kill-entry{background:rgba(10,10,14,0.85);backdrop-filter:blur(10px);
      border:0.5px solid rgba(239,68,68,0.22);border-radius:8px;
      padding:6px 14px;color:#fca5a5;font-size:12px;animation:_ki 0.3s ease both;
      box-shadow:0 4px 12px rgba(0,0,0,0.45);}
    @keyframes _ki{from{opacity:0;transform:translateX(10px)}}
    .toast{padding:8px 24px;border-radius:99px;background:rgba(10,10,14,0.92);
      backdrop-filter:blur(10px);border:0.5px solid rgba(74,222,128,0.25);
      color:#e8e6d9;font-size:13px;font-family:'Crimson Pro',serif;
      box-shadow:0 6px 20px rgba(0,0,0,0.5);
      opacity:0;transform:translateY(8px);transition:all 0.3s;pointer-events:none}
    .toast-show{opacity:1!important;transform:translateY(0)!important}
    .toast-error{border-color:rgba(239,68,68,0.4)!important;color:#fca5a5}
    .ctrl-s{font-family:'Cinzel',serif;font-size:9.5px;letter-spacing:0.2em;
      color:#4ade80;margin-bottom:6px;margin-top:6px;border-bottom:0.5px solid rgba(74,222,128,0.15);padding-bottom:2px}
    .ctrl-r{display:flex;align-items:baseline;gap:12px;padding:5px 0;
      border-bottom:0.5px solid rgba(255,255,255,0.03);font-size:13px}
    .ctrl-k{background:rgba(74,222,128,0.08);border:0.5px solid rgba(74,222,128,0.2);
      border-radius:4px;padding:1px 8px;font-size:10px;color:#4ade80;
      white-space:nowrap;flex-shrink:0;font-family:'Cinzel',serif;letter-spacing:0.05em}
    .ctrl-d{color:#9ca38f;font-size:13px}
    .ctrl-note{color:#9ca38f;font-size:12.5px;font-style:italic;margin:6px 0 0 4px;line-height:1.55}
  `
  document.head.appendChild(s)
}