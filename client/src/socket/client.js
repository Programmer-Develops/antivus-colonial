import { io } from 'socket.io-client'
import { useGameStore } from '../store/gameStore.js'

let socket = null

export function initSocket() {
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000')
  socket = io(SERVER_URL, { transports: ['websocket','polling'], reconnectionAttempts: 5 })
  const store = useGameStore.getState()

  socket.on('connect', () => {
    store.setMyId(socket.id)
    console.log('[socket] connected:', socket.id)
  })
  socket.on('disconnect', (r) => console.warn('[socket] disconnected:', r))

  socket.on('room:joined', ({ roomId, players, mapSeed }) => {
    store.setRoom(roomId, players)
    store.setMap(mapSeed)
    store.setPhase('playing')
    hideLobby()
  })

  socket.on('room:players', (players) => useGameStore.setState({ roomPlayers: players }))

  socket.on('error', ({ msg }) => showToast(msg, 'error'))

  socket.on('state:full', ({ colonies, projectiles, foodShapes, clouds, predators }) => {
    store.setColonies(colonies)
    const mine = colonies[socket.id]
    if (mine) store.updateColony(mine)
    useGameStore.setState({
      projectiles: projectiles || [],
      foodShapes: foodShapes || [],
      clouds: clouds || [],
      predators: predators || []
    })
  })

  socket.on('state:delta', (delta) => {
    const colonies = delta.colonies || delta
    store.setColonies(colonies)
    const mine = colonies[socket.id]
    if (mine) {
      store.updateColony(mine)
      store.updateResources(mine.resources)
    }
    useGameStore.setState({
      projectiles: delta.projectiles || [],
      foodShapes: delta.foodShapes || [],
      clouds: delta.clouds || [],
      predators: delta.predators || []
    })
  })

  socket.on('day:cycle', ({ phase }) => {
    store.setDayCycle(phase)
    showToast(phase === 'night' ? '🌙 Night falls! Apex Predators emerge!' : '☀️ Dawn breaks. Predators retreat.', 'info')
  })

  socket.on('kill:feed', (e) => {
    store.addKill(e)
    if (window.showArenaNotification) {
      window.showArenaNotification(e.text)
    }
  })

  socket.on('game:over', ({ winner, winnerName }) => {
    store.setPhase('gameover')
    showGameOver(winner === socket.id, winnerName)
  })

  // ── Diplomacy Socket Receivers ─────────────────────────────────────────────
  socket.on('relations:ally-request', ({ fromId, fromName }) => {
    useGameStore.setState(s => ({
      allianceRequests: [...s.allianceRequests.filter(r => r.fromId !== fromId), { fromId, fromName }]
    }))
  })

  socket.on('relations:ally-declined', ({ fromName }) => {
    showToast(`🤝 ${fromName} declined your alliance request.`, 'error')
  })

  return socket
}

export const emit = {
  createRoom:   (opts)            => socket?.emit('room:create', opts),
  joinRoom:     (roomId)          => socket?.emit('room:join', { roomId }),
  quickJoin:    (name)            => socket?.emit('room:quickjoin', { name }),
  moveAnts:     (antIds, target)  => socket?.emit('ants:move', { antIds, target }),
  recruitAnt:   (caste)           => socket?.emit('ant:recruit', { caste }),
  buildChamber: (type, position)  => socket?.emit('chamber:build', { type, position }),
  attackTarget: (antIds, tid)     => socket?.emit('ants:attack', { antIds, targetId: tid }),
  sendChat:     (msg)             => socket?.emit('chat', { msg }),

  sendPlayerInput: (input)        => socket?.emit('player:input', input),
  upgradeStat:     (stat)         => socket?.emit('player:upgrade-stat', { stat }),
  evolve:          (className)    => socket?.emit('player:evolve', { className }),

  // ── Diplomacy Emits ───────────────────────────────────────────────────────
  declareWar:      (targetId)     => socket?.emit('relations:declare-war', { targetId }),
  proposeAlliance: (targetId)     => socket?.emit('relations:propose-alliance', { targetId }),
  acceptAlliance:  (targetId)     => socket?.emit('relations:accept-alliance', { targetId }),
  declineAlliance: (targetId)     => socket?.emit('relations:decline-alliance', { targetId })
}

export function getSocket() { return socket }

function hideLobby() {
  const el = document.getElementById('lobby-screen')
  if (el) el.style.display = 'none'
}

function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container')
  if (!c) return
  const t = document.createElement('div')
  t.className = `toast toast-${type}`
  t.textContent = msg
  c.appendChild(t)
  setTimeout(() => t.classList.add('toast-show'), 10)
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 400) }, 3000)
}

function showGameOver(isWinner, winnerName) {
  const o = document.getElementById('gameover-screen')
  if (!o) return
  o.style.display = 'flex'
  document.getElementById('gameover-title').textContent = isWinner ? 'COLONY TRIUMPHANT' : 'COLONY FALLEN'
  document.getElementById('gameover-sub').textContent   = isWinner
    ? 'Your queen reigns supreme over all territories.'
    : `${winnerName || 'Another colony'} consumed the last of your forces.`
}