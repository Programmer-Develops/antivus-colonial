import { RoomManager }    from '../game/roomManager.js'
import { saveGameResult } from '../db/supabase.js'

const rooms = new RoomManager()

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('[socket] connect:', socket.id)

    // ── Room: create ────────────────────────────────────────────────────────
    socket.on('room:create', (opts) => {
      const room = rooms.create(socket.id, opts)
      socket.join(room.id)
      socket.emit('room:joined', {
        roomId:  room.id,
        players: room.players,
        mapSeed: room.mapSeed
      })
      // Send full state immediately so client can render map + colony
      socket.emit('state:full', { colonies: room.getColonies() })
      console.log('[room] created:', room.id, 'by', socket.id)
    })

    // ── Room: join ──────────────────────────────────────────────────────────
    socket.on('room:join', ({ roomId }) => {
      const room = rooms.join(roomId, socket.id)
      if (!room) return socket.emit('error', { msg: 'Room not found or full' })
      socket.join(roomId)
      socket.emit('room:joined', {
        roomId,
        players: room.players,
        mapSeed: room.mapSeed
      })
      io.to(roomId).emit('room:players', room.players)
      socket.emit('state:full', { colonies: room.getColonies() })
      console.log('[room] joined:', roomId, 'by', socket.id)
    })

    // ── Ant commands (rate limited: max 60/sec) ─────────────────────────────
    let cmdCount = 0
    setInterval(() => { cmdCount = 0 }, 1000)

    // Client sends 'ants:move' (plural) with antIds array
    socket.on('ants:move', ({ antIds, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const antId of antIds) {
        room.game.moveAnt(socket.id, antId, target)
      }
    })

    // Also support legacy singular 'ant:move'
    socket.on('ant:move', ({ antId, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.moveAnt(socket.id, antId, target)
    })

    // Client sends 'ants:attack' (plural)
    socket.on('ants:attack', ({ antIds, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const antId of antIds) {
        const kill = room.game.attack(socket.id, antId, targetId)
        if (kill) io.to(room.id).emit('kill:feed', kill)
      }
    })

    // Also support legacy singular 'ant:attack'
    socket.on('ant:attack', ({ antId, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const kill = room.game.attack(socket.id, antId, targetId)
      if (kill) io.to(room.id).emit('kill:feed', kill)
    })

    // ── Chamber build ───────────────────────────────────────────────────────
    socket.on('chamber:build', ({ type, position }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.buildChamber(socket.id, type, position)
    })

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log('[socket] disconnect:', socket.id)
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.removePlayer(socket.id)
      io.to(room.id).emit('room:players', room.players)
      if (room.isEmpty()) {
        await saveGameResult(room.getSummary())
        rooms.delete(room.id)
      }
    })
  })

  // ── Game tick: 20Hz (every 50ms) ─────────────────────────────────────────
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const delta = room.game.tick()
      if (delta) io.to(room.id).emit('state:delta', delta)

      const winner = room.game.checkWinner()
      if (winner) {
        io.to(room.id).emit('game:over', { winner })
        saveGameResult(room.getSummary())
        rooms.delete(room.id)
      }
    }
  }, 50)

  // ── Day/night cycle: every second ────────────────────────────────────────
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const phase = room.game.tickDayCycle()
      if (phase) io.to(room.id).emit('day:cycle', { phase })
    }
  }, 1000)
}