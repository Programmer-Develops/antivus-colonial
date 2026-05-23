// ─── socket/client.js — Socket.io client + all event handlers ────────────────
import { io } from 'socket.io-client'
import { useGameStore } from '../store/gameStore.js'

let socket = null

export function initSocket() {
  socket = io({ transports: ['websocket'], reconnectionAttempts: 5 })
  const store = useGameStore.getState()

  // ── Connection ────────────────────────────────────────────────────────────
  socket.on('connect', () => {
    store.setMyId(socket.id)
    console.log('[socket] connected:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.warn('[socket] disconnected:', reason)
  })

  // ── Room events ───────────────────────────────────────────────────────────
  socket.on('room:joined', ({ roomId, players, mapSeed }) => {
    store.setRoom(roomId, players)
    store.setMap(mapSeed)
    store.setPhase('playing')
    hideLobby()
    console.log('[socket] joined room:', roomId)
  })

  socket.on('room:players', (players) => {
    useGameStore.setState({ roomPlayers: players })
  })

  socket.on('error', ({ msg }) => {
    showToast(msg, 'error')
  })

  // ── Game state ────────────────────────────────────────────────────────────
  socket.on('state:full', ({ colonies }) => {
    store.setColonies(colonies)
    const mine = colonies[socket.id]
    if (mine) store.updateColony(mine)
  })

  socket.on('state:delta', (allColonies) => {
    store.setColonies(allColonies)
    const mine = allColonies[socket.id]
    if (mine) {
      store.updateColony(mine)
      store.updateResources(mine.resources)
    }
  })

  // ── Day/night ─────────────────────────────────────────────────────────────
  socket.on('day:cycle', ({ phase }) => {
    store.setDayCycle(phase)
    showToast(phase === 'night' ? '🌙 Night falls...' : '☀️ Dawn breaks', 'info')
  })

  // ── Combat ────────────────────────────────────────────────────────────────
  socket.on('kill:feed', (entry) => {
    store.addKill(entry)
  })

  // ── Game over ─────────────────────────────────────────────────────────────
  socket.on('game:over', ({ winner, winnerName }) => {
    store.setPhase('gameover')
    showGameOver(winner === socket.id, winnerName)
  })

  return socket
}

// ── Emit helpers (used by UI and input system) ────────────────────────────────
export const emit = {
  createRoom: (opts)           => socket?.emit('room:create', opts),
  joinRoom:   (roomId)         => socket?.emit('room:join', { roomId }),
  moveAnts:   (antIds, target) => socket?.emit('ants:move', { antIds, target }),
  buildChamber:(type, position)=> socket?.emit('chamber:build', { type, position }),
  attackTarget:(antIds, tid)   => socket?.emit('ants:attack', { antIds, targetId: tid }),
  sendChat:   (msg)            => socket?.emit('chat', { msg })
}

export function getSocket() { return socket }

// ── Internal UI helpers ───────────────────────────────────────────────────────
function hideLobby() {
  const el = document.getElementById('lobby-screen')
  if (el) el.style.display = 'none'
}

function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return
  const t = document.createElement('div')
  t.className = `toast toast-${type}`
  t.textContent = msg
  container.appendChild(t)
  setTimeout(() => t.classList.add('toast-show'), 10)
  setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 400) }, 3000)
}

function showGameOver(isWinner, winnerName) {
  const overlay = document.getElementById('gameover-screen')
  if (!overlay) return
  overlay.style.display = 'flex'
  document.getElementById('gameover-title').textContent = isWinner ? 'COLONY TRIUMPHANT' : 'COLONY FALLEN'
  document.getElementById('gameover-sub').textContent = isWinner
    ? 'Your queen reigns supreme over all territories.'
    : `${winnerName}'s colony consumed the last of your forces.`
}