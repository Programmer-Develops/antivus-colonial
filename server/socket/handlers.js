import { RoomManager }    from '../game/roomManager.js'
import { saveGameResult } from '../db/supabase.js'

const rooms = new RoomManager()

export function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('[socket] connect:', socket.id)

    socket.on('room:create', (opts) => {
      const room = rooms.create(socket.id, opts)
      socket.join(room.id)
      socket.emit('room:joined', { roomId: room.id, players: room.players, mapSeed: room.mapSeed })
    })

    socket.on('room:join', ({ roomId }) => {
      const room = rooms.join(roomId, socket.id)
      if (!room) return socket.emit('error', { msg: 'Room not found or full' })
      socket.join(roomId)
      socket.emit('room:joined', { roomId, players: room.players, mapSeed: room.mapSeed })
      io.to(roomId).emit('room:players', room.players)
      socket.emit('state:full', { colonies: room.getColonies() })
    })

    let cmdCount = 0
    setInterval(() => { cmdCount = 0 }, 1000)

    socket.on('ant:move', ({ antId, target }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.moveAnt(socket.id, antId, target)
    })

    socket.on('ant:attack', ({ antId, targetId }) => {
      if (cmdCount++ > 60) return
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const kill = room.game.attack(socket.id, antId, targetId)
      if (kill) io.to(room.id).emit('kill:feed', kill)
    })

    socket.on('chamber:build', ({ type, position }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      room.game.buildChamber(socket.id, type, position)
    })

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

  // Game tick: 20Hz
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

  // Day/night: every second
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const phase = room.game.tickDayCycle()
      if (phase) io.to(room.id).emit('day:cycle', { phase })
    }
  }, 1000)
}