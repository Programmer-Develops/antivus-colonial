import { RoomManager }    from '../game/roomManager.js'
import { saveGameResult } from '../db/supabase.js'

const rooms = new RoomManager()

function getRoomList() {
  return [...rooms.all()]
    .filter(r => !r.isFull())
    .map(r => ({ id:r.id, playerCount:r.players.length, maxPlayers:r.maxPlayers, hostName:r.hostName }))
}

export function registerSocketHandlers(io) {

  io.on('connection', (socket) => {
    console.log('[socket] connect:', socket.id)
    socket.emit('rooms:list', getRoomList())

    socket.on('room:create', (opts) => {
      const room = rooms.create(socket.id, opts)
      socket.join(room.id)
      room.game.setColonyName(socket.id, opts.name || 'Colony')
      socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
      socket.emit('state:full',  { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('room:join', ({ roomId, name }) => {
      const room = rooms.join(roomId, socket.id)
      if (!room) return socket.emit('error', { msg:'Room not found or full' })
      room.game.setColonyName(socket.id, name || 'Colony')
      socket.join(roomId)
      socket.emit('room:joined', { roomId, players:room.players, mapSeed:room.mapSeed })
      io.to(roomId).emit('room:players', room.players)
      socket.emit('state:full', { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('room:quickjoin', ({ name }) => {
      const open = [...rooms.all()].find(r => !r.isFull() && r.players.length > 0)
      if (open) {
        const room = rooms.join(open.id, socket.id)
        if (room) {
          room.game.setColonyName(socket.id, name || 'Colony')
          socket.join(room.id)
          socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
          io.to(room.id).emit('room:players', room.players)
          socket.emit('state:full', { colonies:room.getColonies() })
          io.emit('rooms:list', getRoomList())
          return
        }
      }
      const room = rooms.create(socket.id, { name, maxPlayers:6 })
      room.game.setColonyName(socket.id, name || 'Colony')
      socket.join(room.id)
      socket.emit('room:joined', { roomId:room.id, players:room.players, mapSeed:room.mapSeed })
      socket.emit('state:full',  { colonies:room.getColonies() })
      io.emit('rooms:list', getRoomList())
    })

    socket.on('rooms:refresh', () => {
      socket.emit('rooms:list', getRoomList())
    })

    // ── Direct keyboard WASD / Mouse Aim input sync ──────────────────────────
    socket.on('player:input', (input) => {
      const room = rooms.getByPlayer(socket.id)
      if (room) room.game.updatePlayerInput(socket.id, input)
    })

    // ── Stat point upgrade clicked ───────────────────────────────────────────
    socket.on('player:upgrade-stat', ({ stat }) => {
      const room = rooms.getByPlayer(socket.id)
      if (room) {
        const res = room.game.upgradeStat(socket.id, stat)
        if (!res.ok && res.msg) socket.emit('error', { msg: res.msg })
      }
    })

    // ── Evolve ant caste chosen ──────────────────────────────────────────────
    socket.on('player:evolve', ({ className }) => {
      const room = rooms.getByPlayer(socket.id)
      if (room) {
        const res = room.game.evolvePlayer(socket.id, className)
        if (!res.ok && res.msg) socket.emit('error', { msg: res.msg })
      }
    })

    socket.on('chamber:build', ({ type, position }) => {
      const room = rooms.getByPlayer(socket.id)
      if (!room) return
      const r = room.game.buildChamber(socket.id, type, position)
      if (!r.ok) socket.emit('error', { msg:r.msg })
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
      io.emit('rooms:list', getRoomList())
    })
  })

  // Game tick 20Hz (50ms interval)
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const result = room.game.tick()
      if (result?.changes) {
        io.to(room.id).emit('state:delta', {
          colonies: result.changes,
          projectiles: result.projectiles,
          foodShapes: result.foodShapes,
          clouds: result.clouds,
          predators: result.predators
        })
      }
      if (result?.kills?.length) {
        for (const kill of result.kills) io.to(room.id).emit('kill:feed', kill)
      }
      const winner = room.game.checkWinner()
      if (winner) {
        const winnerColony = room.game.getColonies()[winner]
        io.to(room.id).emit('game:over', { winner, winnerName: winnerColony?.name || 'Unknown' })
        saveGameResult(room.getSummary())
        rooms.delete(room.id)
      }
    }
  }, 50)

  // Day/night cycle ticker (1s interval)
  setInterval(() => {
    for (const room of rooms.all()) {
      if (!room.isPlaying()) continue
      const phase = room.game.tickDayCycle()
      if (phase) io.to(room.id).emit('day:cycle', { phase })
    }
  }, 1000)
}