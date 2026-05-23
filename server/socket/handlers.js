import { RoomManager }    from '../game/roomManager.js'
import { saveGameResult } from '../db/supabase.js'

const rooms = new RoomManager()

export function registerSocketHandlers(io) {

  // ── Send room list to requesting client ────────────────────────────────────
  function broadcastRoomList() {
    const list = [...rooms.all()]
      .filter(r => !r.isFull())
      .map(r => ({
        id:         r.id,
        playerCount: r.players.length,
        maxPlayers:  r.maxPlayers,
        hostName:    r.hostName || 'Unknown'
      }))
    io.emit('rooms:list', list)
  }

  io.on('connection', (socket) => {
    console.log('[socket] connect:', socket.id)

    // Send current open rooms immediately on connect
    socket.emit('rooms:list', [...rooms.all()]
      .filter(r => !r.isFull())
      .map(r => ({ id: r.id, playerCount: r.players.length, maxPlayers: r.maxPlayers, hostName: r.hostName }))
    )

    // ── Room: create ──────────────────────────────────────────────────────────
    socket.on('room:create', (opts) => {
      const room = rooms.create(socket.id, opts)
      socket.join(room.id)
      socket.emit('room:joined', { roomId: room.id, players: room.players, mapSeed: room.mapSeed })
      socket.emit('state:full',  { colonies: room.getColonies() })
      broadcastRoomList()
      console.log('[room] created:', room.id)
    })

    // ── Room: join by code ────────────────────────────────────────────────────
    socket.on('room:join', ({ roomId }) => {
      const room = rooms.join(roomId, socket.id)
      if (!room) return socket.emit('error', { msg: 'Room not found or full' })
      socket.join(roomId)
      socket.emit('room:joined', { roomId, players: room.players, mapSeed: room.mapSeed })
      io.to(roomId).emit('room:players', room.players)
      socket.emit('state:full', { colonies: room.getColonies() })
      broadcastRoomList()
    })

    // ── Room: quick join (auto-find open room) ────────────────────────────────
    socket.on('room:quickjoin', ({ name }) => {
      // Find a room with space
      const open = [...rooms.all()].find(r => !r.isFull() && r.players.length > 0)
      if (open) {
        const room = rooms.join(open.id, socket.id)
        if (room) {
          socket.join(room.id)
          socket.emit('room:joined', { roomId: room.id, players: room.players, mapSeed: room.mapSeed })
          io.to(room.id).emit('room:players', room.players)
          socket.emit('state:full', { colonies: room.getColonies() })
          broadcastRoomList()
          return
        }
      }
      // No open room — create one
      const room = rooms.create(socket.id, { name, maxPlayers: 6 })
      socket.join(room.id)
      socket.emit('room:joined', { roomId: room.id, players: room.players, mapSeed: room.mapSeed })
      socket.emit('state:full',  { colonies: room.getColonies() })
      broadcastRoomList()
    })

    // ── Ant movement ──────────────────────────────────────────────────────────
    let cmdCount = 0
    setInterval(() => { cmdCount = 0 }, 1000)

    socket.on('ants:move', ({ antIds, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const id of antIds) room.game.moveAnt(socket.id, id, target)
    })

    socket.on('ant:move', ({ antId, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.moveAnt(socket.id, antId, target)
    })

    // ── Ant recruitment ───────────────────────────────────────────────────────
    socket.on('ant:recruit', ({ caste }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const result = room.game.recruitAnt(socket.id, caste)
      if (!result.ok) socket.emit('error', { msg: result.msg })
    })

    // ── Combat ────────────────────────────────────────────────────────────────
    socket.on('ants:attack', ({ antIds, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      for (const id of antIds) {
        const kill = room.game.attack(socket.id, id, targetId)
        if (kill) io.to(room.id).emit('kill:feed', kill)
      }
    })

    socket.on('ant:attack', ({ antId, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const kill = room.game.attack(socket.id, antId, targetId)
      if (kill) io.to(room.id).emit('kill:feed', kill)
    })

    // ── Building ──────────────────────────────────────────────────────────────
    socket.on('chamber:build', ({ type, position }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const result = room.game.buildChamber(socket.id, type, position)
      if (!result.ok) socket.emit('error', { msg: result.msg })
    })

    // ── Disconnect ────────────────────────────────────────────────────────────
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
      broadcastRoomList()
    })
  })

  // ── Game tick 20Hz ────────────────────────────────────────────────────────
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

  // ── Day/night ─────────────────────────────────────────────────────────────
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const phase = room.game.tickDayCycle()
      if (phase) io.to(room.id).emit('day:cycle', { phase })
    }
  }, 1000)
}